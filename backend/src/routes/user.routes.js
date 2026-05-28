// user.routes.js

import { Router }      from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, getOrderHistory, cancelOrder, getAddresses, addAddress, deleteAddress, deleteAccount  } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile',          verifyToken, getProfile);
router.put('/profile',          verifyToken, updateProfile);
router.get('/orders',           verifyToken, getOrderHistory);
router.delete('/orders/:id', verifyToken, cancelOrder); 
router.get('/addresses',        verifyToken, getAddresses);
router.post('/addresses',       verifyToken, addAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);
router.delete('/account', verifyToken, deleteAccount);

export default router;