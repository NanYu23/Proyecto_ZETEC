// paypal.routes.js

import { Router } from 'express';
import { createOrder, captureOrder, getOrderDetails } from '../controllers/paypal.controller.js';

const router = Router();

router.post('/create-order',          createOrder);
router.post('/capture-order',         captureOrder);
router.get('/order-details/:orderId', getOrderDetails);

export default router;