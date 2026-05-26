// paypal.routes.js

import { Router } from 'express';
import { verifyTokenOptional } from '../middleware/auth.middleware.js';
import { createOrder, captureOrder, getOrderDetails } from '../controllers/paypal.controller.js';

const router = Router();

router.post('/create-order',          verifyTokenOptional, createOrder);
router.post('/capture-order',         captureOrder);
router.get('/order-details/:orderId', getOrderDetails);

export default router;