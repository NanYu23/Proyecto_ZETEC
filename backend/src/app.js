// app.js

import express from 'express';
import cors from 'cors';
import productosRoutes from './routes/productos.routes.js';
import paypalRoutes    from './routes/paypal.routes.js';
import direccionesRoutes from './routes/direcciones.routes.js';
import authRoutes      from './routes/auth.routes.js';
import userRoutes      from './routes/user.routes.js';
import cartRoutes      from './routes/carrito.routes.js';
import panelRoutes       from './routes/panel.routes.js'; 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api',             productosRoutes);
app.use('/api/paypal',      paypalRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/user',        userRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/panel',       panelRoutes);

export default app;