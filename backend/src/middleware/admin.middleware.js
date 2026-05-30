// admin.middleware.js
// Middleware de autorización para rutas exclusivas de administrador.
export const adminMiddleware = (req, res, next) => {

    console.log('adminMiddleware - req.user:', req.user);

    //¿existe el usuario en la petición?
    if(!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    //¿tiene rol de administrador?
    if(req.user.rol !== 2) {
        return res.status(403).json({ message: 'Acceso denegado: Solo administradores' });
    }
    next();
};