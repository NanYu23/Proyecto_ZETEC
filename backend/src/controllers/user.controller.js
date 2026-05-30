// user.controller.js
// Maneja perfil, historial de órdenes, direcciones y eliminación de cuenta.

import db from '../config/db.js';

// Devuelve los datos básicos del perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id], // ID extraído del token JWT por el middleware
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error en getProfile:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualiza username y email del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: 'Nombre y correo son requeridos',
      });
    }

    //Validar correo
    const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [
      email,
      req.user.id,
    ]);

    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: 'El correo electrónico ya está registrado',
      });
    }

    // Validar usuario
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.user.id],
    );

    if (existingUsername.length > 0) {
      return res.status(409).json({
        message: 'El nombre de usuario ya está en uso',
      });
    }

    // ===== ACTUALIZAR =====
    await db.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [
      username,
      email,
      req.user.id,
    ]);

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
    });
  } catch (error) {
    console.error('Error en updateProfile:', error);

    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

// Devuelve el historial de órdenes del usuario con sus productos
export const getOrderHistory = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
                o.id,
                o.paypal_order_id,
                o.total,
                o.moneda,
                o.estado,
                o.cancelado,
                o.direccion,
                o.fecha_creacion
            FROM ordenes o
            WHERE o.cliente_email = (SELECT email FROM users WHERE id = ?)
            AND o.cancelado = 0
            AND o.estado IN ('COMPLETED', 'CREADO', 'CREATED')
            ORDER BY o.fecha_creacion DESC`,
      [req.user.id],
    );

    // Agrega los items a cada orden
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT producto_id, nombre, cantidad, precio_unitario, subtotal
                 FROM orden_items WHERE orden_id = ?`,
        [order.id],
      );
      order.items = items;  // Inyecta los items dentro del objeto de la orden
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error en getOrderHistory:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cancela una orden pendiente del usuario autenticado
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params; // ID de la orden a cancelar

    // Busca la orden verificando que pertenezca al usuario autenticado.
    const [rows] = await db.query(
      `SELECT id, estado FROM ordenes 
             WHERE id = ? AND cliente_email = (SELECT email FROM users WHERE id = ?)`,
      [id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

      // Solo se pueden cancelar órdenes que aún no han sido pagadas.
    const estado = rows[0].estado;
    if (estado !== 'CREADO' && estado !== 'CREATED') {
      return res.status(400).json({ message: 'Solo se pueden cancelar órdenes pendientes' });
    }

    await db.query('UPDATE ordenes SET cancelado = 1 WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Orden cancelada correctamente' });
  } catch (error) {
    console.error('Error en cancelOrder:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /account
export const deleteAccount = async (req, res) => {
  try {
    // 1. Extraemos la fecha de cancelación enviada en el body por Angular
    const { fecha_cancelacion } = req.body;

    // 2. Si no viene (respaldo), generamos un objeto Date con la fecha del servidor
    // Si usas el formato ISO string directamente, es totalmente compatible con MySQL
    const fechaActual = fecha_cancelacion || new Date().toISOString();

    // 3. Modificamos la query para actualizar tanto el estado 'activo' como la nueva columna 'cancelado_at'
    const [result] = await db.query('UPDATE users SET activo = 0, cancelado_at = ? WHERE id = ?', [
      fechaActual,
      req.user.id,
    ]);

    // Validar si el usuario existía
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Cuenta desactivada y fecha registrada correctamente' });
  } catch (error) {
    console.error('Error en deleteAccount:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
