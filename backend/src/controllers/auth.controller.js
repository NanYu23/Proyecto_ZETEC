// auth.controller.js

import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET); //este es nuevo
        const { username, email, password } = req.body;

        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        return res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });

    } catch (error) {
        console.error('Error en register:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        const user = rows[0];
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: 'Login exitoso', token });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};