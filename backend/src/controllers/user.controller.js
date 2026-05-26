// user.controller.js

import db from '../config/db.js';

// GET /profile
export const getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        return res.status(200).json({ user });

    } catch (error) {
        console.error('Error en getProfile:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// PUT /profile
export const updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Nombre y correo son requeridos' });
        }

        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'El correo ya está en uso' });
        }

        await db.query(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [username, email, req.user.id]
        );

        return res.status(200).json({ message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.error('Error en updateProfile:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// GET /orders
export const getOrderHistory = async (req, res) => {
    try {
        // Primero obtener las órdenes
        const [orders] = await db.query(
            `SELECT 
                o.id,
                o.paypal_order_id,
                o.total,
                o.moneda,
                o.estado,
                o.direccion,
                o.fecha_creacion
            FROM ordenes o
            WHERE o.cliente_email = (SELECT email FROM users WHERE id = ?)
            AND o.estado = 'COMPLETED'
            ORDER BY o.fecha_creacion DESC`,
            [req.user.id]
        );

        // Luego obtener los items de cada orden
        for (const order of orders) {
            const [items] = await db.query(
                `SELECT producto_id, nombre, cantidad, precio_unitario, subtotal
                 FROM orden_items
                 WHERE orden_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        return res.status(200).json({ orders });

    } catch (error) {
        console.error('Error en getOrderHistory:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// GET /addresses
export const getAddresses = async (req, res) => {
    try {
        const [addresses] = await db.query(
            `SELECT id, direccion, telefono, fecha_creacion
             FROM direcciones
             WHERE usuario_id = ?
             ORDER BY fecha_creacion DESC`,
            [req.user.id]
        );

        return res.status(200).json({ addresses });

    } catch (error) {
        console.error('Error en getAddresses:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// POST /addresses
export const addAddress = async (req, res) => {
    try {
        const { direccion, telefono } = req.body;

        if (!direccion || !telefono) {
            return res.status(400).json({ message: 'Dirección y teléfono son requeridos' });
        }

        const [result] = await db.query(
            'INSERT INTO direcciones (usuario_id, direccion, telefono) VALUES (?, ?, ?)',
            [req.user.id, direccion, telefono]
        );

        return res.status(201).json({ message: 'Dirección agregada', id: result.insertId });

    } catch (error) {
        console.error('Error en addAddress:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// DELETE /addresses/:id
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM direcciones WHERE id = ? AND usuario_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Dirección no encontrada' });
        }

        return res.status(200).json({ message: 'Dirección eliminada' });

    } catch (error) {
        console.error('Error en deleteAddress:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};