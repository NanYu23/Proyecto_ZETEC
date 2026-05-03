//app.js
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const app = express();

app.use(cors()); //activa CORS para permitir solicitudes desde el frontend
app.use(express.json()); //recibir json
app.use('/api', productosRoutes);
module.exports = app;

//RUTA PARA LLAMAR A LA API: http://localhost:3000/api/productos
//debe de mostrar la lista de productos obtenida de la base de datos en formato JSON.