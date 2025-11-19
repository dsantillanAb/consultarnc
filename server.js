const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configurar pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta principal - Landing page
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta de documentación
app.get('/documentacion', (req, res) => {
  res.render('documentacion');
});

// API - Buscar por RNC
app.get('/api/rnc/:rnc', async (req, res) => {
  try {
    const { rnc } = req.params;
    const result = await pool.query(
      'SELECT * FROM rnc_contribuyentes WHERE rnc = $1',
      [rnc]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RNC no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// API - Buscar por nombre
app.get('/api/buscar', async (req, res) => {
  try {
    const { nombre, limit = 10 } = req.query;
    
    if (!nombre) {
      return res.status(400).json({ error: 'Parámetro nombre requerido' });
    }
    
    const result = await pool.query(
      'SELECT * FROM rnc_contribuyentes WHERE razon_social ILIKE $1 LIMIT $2',
      [`%${nombre}%`, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// API - Estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) as total FROM rnc_contribuyentes');
    const activos = await pool.query('SELECT COUNT(*) as activos FROM rnc_contribuyentes WHERE estado = $1', ['ACTIVO']);
    const regimenes = await pool.query('SELECT regimen_pago, COUNT(*) as cantidad FROM rnc_contribuyentes GROUP BY regimen_pago');
    
    res.json({
      total: parseInt(total.rows[0].total),
      activos: parseInt(activos.rows[0].activos),
      regimenes: regimenes.rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
