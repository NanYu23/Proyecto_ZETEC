// productos.controller.js

import db from '../config/db.js';

// Devuelve todos los productos activos de la tienda
export const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE activo = 1');
    res.json(rows); // Devuelve el array directamente
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};