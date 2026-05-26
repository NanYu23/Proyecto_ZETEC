import db from '../config/db.js';

export const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.status(200).json({ producto: rows[0] });
    } catch (error) {
        console.error('Error en getProductoById:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, inStock, category, description, imageUrl } = req.body;

        await db.query(
            `UPDATE productos 
             SET name = ?, price = ?, inStock = ?, category = ?, description = ?, imageUrl = ?
             WHERE id = ?`,
            [name, price, inStock, category, description, imageUrl, id]
        );

        return res.status(200).json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error en updateProducto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};