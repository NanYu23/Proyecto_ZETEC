// user.routes.js

import { Router }      from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, getOrderHistory, cancelOrder, deleteAccount, cancelarOrdenesPendientes } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile',          verifyToken, getProfile);
router.put('/profile',          verifyToken, updateProfile);
router.get('/orders',           verifyToken, getOrderHistory);
router.delete('/orders/:id', verifyToken, cancelOrder); 
router.delete('/account', verifyToken, deleteAccount);
router.post('/cancelar-pendientes', verifyToken, cancelarOrdenesPendientes);

export default router;