const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const jugadoresRoutes = require('./routes/jugadores');
const videojuegosRoutes = require('./routes/videojuegos');
const puntuacionesRoutes = require('./routes/puntuaciones');
const reportesRoutes = require('./routes/reportes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/videojuegos', videojuegosRoutes);
app.use('/api/puntuaciones', puntuacionesRoutes);
app.use('/api', reportesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(400).json({ error: err.sqlMessage || 'Error de validación en el procedimiento almacenado' });
  }
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El registro duplicado no es válido' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});