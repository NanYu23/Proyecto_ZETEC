// db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; // Importa dotenv para leer variables de entorno
dotenv.config(); // Carga las variables del archivo .env 

// Crea el pool de conexiones con la configuración de la base de datos.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Pool de conexiones MySQL listo');

// Exporta el pool para que otros archivos puedan usarlo al importar este módulo.
export default pool;

// Un pool es un grupo de conexiones reutilizables, lo que es más eficiente que
// abrir y cerrar una conexión nueva cada vez que se necesita hacer una consulta.