// auth.controller.js
// Controlador de autenticación: maneja registro, login y recuperación de contraseña.

import db from '../config/db.js';
import bcrypt from 'bcrypt';   // Para encriptar y comparar contraseñas
import jwt from 'jsonwebtoken'; // Para generar tokens de sesión seguros
import { enviarCodigoRecuperacion } from '../services/email.service.js';  // Servicio de correo


// Registra un nuevo usuario en el sistema
export const register = async (req, res) => {
  try {
    const { username, password, direccion, terminos_aceptados } = req.body;

    // Normaliza el email: quita espacios y convierte a minúsculas
    const email = req.body.email.trim().toLowerCase();

    console.log('Datos recibidos:', { username, email, direccion });

    // Verifica que no exista otro usuario con el mismo email
    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: 'El correo electrónico ya está registrado',
      });
    }

    // Verifica que el nombre de usuario tampoco esté 
    const [existingUsername] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUsername.length > 0) {
      return res.status(409).json({
        message: 'El nombre de usuario ya está en uso',
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10); //el 10 es el número de salt rounds

    // Insertar usuario
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, terminos_aceptados) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, terminos_aceptados || 0],
    );

    // ID autogenerado del nuevo usuario
    const userId = result.insertId;

    // Guardar dirección
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

// Autentica un usuario y devuelve un token JWT
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verifica que la cuenta esté activa (activo = 1)
    if (user.activo === 0) {
      return res.status(403).json({ message: 'Esta cuenta ha sido desactivada' });
    }

    // bcrypt.compare compara la contraseña en texto plano con el hash guardado
    // Devuelve true si coinciden, false si no
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Genera un token JWT que contiene el ID y rol del usuario.
    // Este token se firma con JWT_SECRET (clave privada del servidor) y expira en 1 hora.
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

// verifica el código y actualiza la contraseña
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Valida que todos los campos necesarios estén llenos
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

    // Encripta la nueva contraseña antes de guardarla
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
