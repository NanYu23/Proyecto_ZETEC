// direcciones.routes.js

import { Router } from 'express';
import { getDirecciones, agregarDireccion } from '../controllers/direcciones.controller.js';

const router = Router();

router.get('/:usuarioId', getDirecciones);
router.post('/', agregarDireccion);

export default router;