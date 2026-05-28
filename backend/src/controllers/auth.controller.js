// auth.controller.js

import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enviarCodigoRecuperacion } from '../services/email.service.js';

export const register = async (req, res) => {
  try {
    const { username, password, direccion, terminos_aceptados } = req.body;

    const email = req.body.email.trim().toLowerCase();

    console.log('Datos recibidos:', { username, email, direccion });

    // ===== VALIDAR CORREO =====
    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: 'El correo electrónico ya está registrado',
      });
    }

    // ===== VALIDAR USERNAME =====
    const [existingUsername] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUsername.length > 0) {
      return res.status(409).json({
        message: 'El nombre de usuario ya está en uso',
      });
    }

    // ===== ENCRIPTAR PASSWORD =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== INSERTAR USUARIO =====
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, terminos_aceptados) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, terminos_aceptados || 0],
    );

    const userId = result.insertId;

    // ===== GUARDAR DIRECCIÓN =====
    if (direccion) {
      await db.query('INSERT INTO direcciones (usuario_id, direccion) VALUES (?, ?)', [
        userId,
        direccion,
      ]);
    }

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId,
    });
  } catch (error) {
    console.error('Error en register:', error);

    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.activo === 0) {
      return res.status(403).json({ message: 'Esta cuenta ha sido desactivada' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login exitoso', token, rol: user.rol });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/*RECUPERACIÓN DE CONTRASEÑA */
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Por seguridad respondemos igual aunque no exista
      return res.status(200).json({ message: 'Si el correo existe, recibirás un código' });
    }

    // Generar código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Invalidar códigos anteriores
    await db.query('UPDATE password_reset_codes SET used = 1 WHERE email = ?', [email]);

    // Guardar nuevo código
    await db.query('INSERT INTO password_reset_codes (email, code, expires_at) VALUES (?, ?, ?)', [
      email,
      code,
      expiresAt,
    ]);

    // Enviar correo
    await enviarCodigoRecuperacion({ email, username: users[0].username, code });

    return res.status(200).json({ message: 'Código enviado al correo' });
  } catch (error) {
    console.error('Error en solicitarRecuperacion:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar código
    const [codes] = await db.query(
      `SELECT id FROM password_reset_codes 
             WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()`,
      [email, code],
    );

    if (codes.length === 0) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Marcar código como usado
    await db.query('UPDATE password_reset_codes SET used = 1 WHERE id = ?', [codes[0].id]);

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
