// admin.middleware.js
export const adminMiddleware = (req, res, next) => {

    console.log('adminMiddleware - req.user:', req.user);

    if(!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    if(req.user.rol !== 2) {
        return res.status(403).json({ message: 'Acceso denegado: Solo administradores' });
    }
    next();
};