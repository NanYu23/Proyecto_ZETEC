// carrito.routes.js

import { Router }      from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/carrito.controller.js';

const router = Router();

router.get('/',               verifyToken, getCart);
router.post('/',              verifyToken, addToCart);
router.put('/:productoId',    verifyToken, updateCartItem);
router.delete('/:productoId', verifyToken, removeFromCart);
router.delete('/',            verifyToken, clearCart);

export default router;