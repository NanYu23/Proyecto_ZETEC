// direcciones.controller.js

import db from '../config/db.js';

export const getDirecciones = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM direcciones WHERE usuario_id = ? AND activo = 1 ORDER BY fecha_creacion ASC',
      [req.params.usuarioId]  // este es el que usa DireccionService
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const agregarDireccion = async (req, res) => {
  const { usuario_id, direccion } = req.body; 
  try {
    const [result] = await db.query(
      'INSERT INTO direcciones (usuario_id, direccion) VALUES (?, ?)',
      [usuario_id, direccion]
    );
    res.json({ success: true, data: { id: result.insertId, direccion } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};