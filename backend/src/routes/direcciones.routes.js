const express = require('express');
const router = express.Router();
const { getDirecciones, agregarDireccion } = require('../controllers/direcciones.controller');

router.get('/:usuarioId', getDirecciones);
router.post('/', agregarDireccion);

module.exports = router;