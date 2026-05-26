// productos.controller.js

import db from '../config/db.js';

export const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE activo = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};