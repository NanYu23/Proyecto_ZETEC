// carrito.controller.js

import db from '../config/db.js';

export const getCart = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT
                ci.id,
                ci.cantidad,
                ci.added_at,
                p.id          AS producto_id,
                p.name        AS nombre,
                p.price       AS precio,
                p.imageUrl,
                p.inStock,
                (p.price * ci.cantidad) AS subtotal
            FROM cart_items ci
            JOIN productos p ON p.id = ci.producto_id
            WHERE ci.user_id = ?
            ORDER BY ci.added_at DESC`,
            [req.user.id]
        );

        const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        return res.status(200).json({ items, total });

    } catch (error) {
        console.error('Error en getCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { producto_id, cantidad = 1 } = req.body;

        if (!producto_id || cantidad < 1) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        const [product] = await db.query(
            'SELECT id FROM productos WHERE id = ?', [producto_id]
        );
        if (product.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await db.query(
            `INSERT INTO cart_items (user_id, producto_id, cantidad)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
            [req.user.id, producto_id, cantidad]
        );

        return res.status(200).json({ message: 'Producto agregado al carrito' });

    } catch (error) {
        console.error('Error en addToCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productoId } = req.params;
        const { cantidad }   = req.body;

        if (!cantidad || cantidad < 1) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        const [result] = await db.query(
            `UPDATE cart_items SET cantidad = ?
             WHERE user_id = ? AND producto_id = ?`,
            [cantidad, req.user.id, productoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        return res.status(200).json({ message: 'Cantidad actualizada' });

    } catch (error) {
        console.error('Error en updateCartItem:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productoId } = req.params;

        const [result] = await db.query(
            'DELETE FROM cart_items WHERE user_id = ? AND producto_id = ?',
            [req.user.id, productoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        return res.status(200).json({ message: 'Producto eliminado' });

    } catch (error) {
        console.error('Error en removeFromCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        return res.status(200).json({ message: 'Carrito vaciado' });

    } catch (error) {
        console.error('Error en clearCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};