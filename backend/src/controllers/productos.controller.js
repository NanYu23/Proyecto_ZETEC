// productos.controller.js
const db = require('../config/db');

// Obtener todos los productos
const getProductos = (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json(results); //regresa la respuesta en formato JSON con los productos obtenidos de la base de datos
    });
};

module.exports = { getProductos }; //usar getProductos en otros archivos, como en las rutas