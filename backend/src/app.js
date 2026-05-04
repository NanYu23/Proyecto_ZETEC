//app.js

const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const app = express();

app.use(cors()); //activa CORS para permitir solicitudes desde el frontend
app.use(express.json()); //recibir json
app.use('/api', productosRoutes);
app.use('/api/paypal', require('./routes/paypal.routes'));

module.exports = app;
