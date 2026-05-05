const db = require('../config/db');

const getDirecciones = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM direcciones WHERE usuario_id = ? ORDER BY fecha_creacion ASC',
      [req.params.usuarioId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const agregarDireccion = async (req, res) => {
  const { usuario_id = 1, direccion, telefono } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO direcciones (usuario_id, direccion, telefono) VALUES (?, ?, ?)',
      [usuario_id, direccion, telefono]
    );
    res.json({ success: true, data: { id: result.insertId, direccion, telefono } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getDirecciones, agregarDireccion };