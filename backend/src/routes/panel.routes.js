import { Router }          from 'express';
import { verifyToken }     from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import {
    getProductoById,
    updateProducto,
    createProducto,
    deleteProducto,
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    reactivarProducto
} from '../controllers/admin.controller.js';

const router = Router();

router.get('/productos/:id',  verifyToken, adminMiddleware, getProductoById);
router.put('/productos/:id',  verifyToken, adminMiddleware, updateProducto);
router.post('/productos',     verifyToken, adminMiddleware, createProducto);
router.delete('/productos/:id', verifyToken, adminMiddleware, deleteProducto);

router.get('/categorias',          verifyToken, adminMiddleware, getCategorias);
router.post('/categorias',         verifyToken, adminMiddleware, createCategoria);
router.put('/categorias/:id',      verifyToken, adminMiddleware, updateCategoria);
router.delete('/categorias/:id', verifyToken, adminMiddleware, deleteCategoria); 

router.put('/productos/:id/reactivar', reactivarProducto);

export default router;