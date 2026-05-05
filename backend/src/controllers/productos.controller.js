// productos.controller.js
const db = require('../config/db');

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');

    res.json(rows);

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports = { getProductos };