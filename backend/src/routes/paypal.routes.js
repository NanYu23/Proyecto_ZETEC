// paypal.routes.js

const express = require('express');
const router = express.Router();
const { createOrder, captureOrder, getOrderDetails } = require('../controllers/paypal.controller');

// Crear una nueva orden
router.post('/create-order', createOrder);

// Capturar una orden existente (después de que el usuario la apruebe)
router.post('/capture-order', captureOrder);

// Obtener detalles de una orden
router.get('/order-details/:orderId', getOrderDetails);

module.exports = router;
