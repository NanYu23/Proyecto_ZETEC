//server.js
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});