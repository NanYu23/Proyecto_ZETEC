// auth.middleware.js
// Middleware de autenticación JWT.

import jwt from 'jsonwebtoken';

// Si no hay token válido, bloquea la petición
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Si no viene el header, rechaza inmediatamente
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    
    // split(' ')[1] parte el string por el espacio y toma la segunda parte:
    // "Bearer <token>" → ["Bearer", "<token>"] → toma índice [1]
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
         // Inyecta el payload decodificado en req.use
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

// Intenta leer el token si existe, pero nunca bloquea la petición.
export const verifyTokenOptional = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) { next(); return; }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        // token inválido, continuar sin usuario
    }
    next();
};