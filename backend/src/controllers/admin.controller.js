// Controlador para las operaciones administrativas del sistema.
import db from '../config/db.js'; // Importa el pool de conexiones a MySQL

// Busca y devuelve un producto específico por su ID
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

// Actualiza todos los campos de un producto existente
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

// Crea un nuevo producto en la base de datos
export const createProducto = async (req, res) => {
    try {
        const { name, price, inStock, category, description, imageUrl } = req.body;

         // los campos obligatorios no pueden estar vacíos
        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Nombre, precio y categoría son requeridos' });
        }

        // Inserta el nuevo producto; si no se mandan inStock/description/imageUrl,
        // se usan valores por defecto (0 o cadena vacía)
        const [result] = await db.query(
            `INSERT INTO productos (name, price, inStock, category, description, imageUrl)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, inStock || 0, category, description || '', imageUrl || '']
        );

        return res.status(201).json({ message: 'Producto creado correctamente', id: result.insertId });

    } catch (error) {
        console.error('Error en createProducto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Devuelve todas las categorías activas, ordenadas alfabéticamente
export const getCategorias = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre ASC'
        );
        return res.status(200).json({ categorias: rows });
    } catch (error) {
        console.error('Error en getCategorias:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crea una nueva categoría, verificando que no exista una con el mismo nombre
export const createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre?.trim()) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        const [existing] = await db.query(
            'SELECT id FROM categorias WHERE nombre = ?', [nombre.trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'La categoría ya existe' });
        }

        const [result] = await db.query(
            'INSERT INTO categorias (nombre) VALUES (?)', [nombre.trim()]
        );
        return res.status(201).json({ message: 'Categoría creada', id: result.insertId });

    } catch (error) {
        console.error('Error en createCategoria:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualiza el nombre de una categoría Y también actualiza todos los productos con esa categoría
export const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        // Actualizar también los productos que usen esta categoría
        const [categoria] = await db.query('SELECT nombre FROM categorias WHERE id = ?', [id]);
        if (categoria.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const nombreAnterior = categoria[0].nombre;

        await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre.trim(), id]);
        await db.query(
            'UPDATE productos SET category = ? WHERE category = ?',
            [nombre.trim(), nombreAnterior]
        );

        return res.status(200).json({ message: 'Categoría actualizada' });

    } catch (error) {
        console.error('Error en updateCategoria:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// En lugar de eliminar el registro, lo "desactiva" poniendo activo = 0
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE productos SET activo = 0 WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.status(200).json({ message: 'Producto eliminado correctamente' });

    } catch (error) {
        console.error('Error en deleteProducto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Desactiva una categoría sin eliminarla físicamente de la base de datos
export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE categorias SET activo = 0 WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        return res.status(200).json({ message: 'Categoría eliminada correctamente' });

    } catch (error) {
        console.error('Error en deleteCategoria:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Reactiva un producto que fue desactivado previamente (activo = 1)
export const reactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE productos SET activo = 1 WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.status(200).json({ message: 'Producto reactivado correctamente' });

    } catch (error) {
        console.error('Error en reactivarProducto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Devuelve todos los productos que han sido "eliminados" (activo = 0)
export const getProductosInactivos = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE activo = 0 ORDER BY name ASC'
        );
        return res.status(200).json({ productos: rows });
    } catch (error) {
        console.error('Error en getProductosInactivos:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Devuelve todas las órdenes con sus productos y el nombre del cliente
export const getAllOrdenes = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT 
                o.id,
                o.paypal_order_id,
                o.cliente_nombre,
                o.cliente_email,
                o.total,
                o.moneda,
                o.estado,
                o.cancelado,
                o.direccion,
                o.fecha_creacion
            FROM ordenes o
            ORDER BY o.fecha_creacion DESC`
        );

        for (const order of orders) {
            const [items] = await db.query(
                `SELECT producto_id, nombre, cantidad, precio_unitario, subtotal
                 FROM orden_items WHERE orden_id = ?`,
                [order.id]
            );
            order.items = items;

            // Obtener nombre real del usuario
            const [user] = await db.query(
                'SELECT username FROM users WHERE id = ?',
                [order.cliente_nombre]
            );
            order.username = user.length > 0 ? user[0].username : 'Cliente';
        }

        return res.status(200).json({ orders });

    } catch (error) {
        console.error('Error en getAllOrdenes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
