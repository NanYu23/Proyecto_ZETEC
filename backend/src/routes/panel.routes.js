import { Router }          from 'express';
import { verifyToken }     from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { getProductoById, updateProducto, createProducto } from '../controllers/admin.controller.js';

const router = Router();

router.get('/productos/:id',  verifyToken, adminMiddleware, getProductoById);
router.put('/productos/:id',  verifyToken, adminMiddleware, updateProducto);
router.post('/productos',     verifyToken, adminMiddleware, createProducto);
export default router;