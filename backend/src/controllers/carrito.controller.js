// carrito.controller.js
// Maneja todas las operaciones sobre los items del carrito de un usuario autenticado.

import db from '../config/db.js';

// Devuelve todos los productos en el carrito del usuario, más el total a pagar
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
            [req.user.id]   // ID del usuario extraído del token JWT por el middleware
        );

        // Calcula el total sumando los subtotales de todos los items.
        // Number() convierte el subtotal a número por si MySQL lo devuelve como string.
        const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        return res.status(200).json({ items, total });

    } catch (error) {
        console.error('Error en getCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Agrega un producto al carrito, o incrementa su cantidad si ya estaba
export const addToCart = async (req, res) => {
    try {
        const { producto_id, cantidad = 1 } = req.body;

        if (!producto_id || cantidad < 1) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Verifica que el producto exista antes de agregarlo al carrito
        const [product] = await db.query(
            'SELECT id FROM productos WHERE id = ?', [producto_id]
        );
        if (product.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // si el producto ya está en el carrito, ejecuta el UPDATE y suma la cantidad nueva a la que ya había
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

// Reemplaza la cantidad de un producto en el carrito
export const updateCartItem = async (req, res) => {
    try {
        const { productoId } = req.params;
        const { cantidad }   = req.body;

        if (!cantidad || cantidad < 1) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        // Actualiza la cantidad filtrando por usuario Y producto
        const [result] = await db.query(
            `UPDATE cart_items SET cantidad = ?
             WHERE user_id = ? AND producto_id = ?`,
            [cantidad, req.user.id, productoId]
        );

        // Si affectedRows es 0, ese producto no estaba en el carrito del usuario
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        return res.status(200).json({ message: 'Cantidad actualizada' });

    } catch (error) {
        console.error('Error en updateCartItem:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Elimina un producto específico del carrito del usuario
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

// Vacía completamente el carrito del usuario
export const clearCart = async (req, res) => {
    try {
        // Elimina TODOS los items del usuario de una sola vez
        await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        return res.status(200).json({ message: 'Carrito vaciado' });

    } catch (error) {
        console.error('Error en clearCart:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};