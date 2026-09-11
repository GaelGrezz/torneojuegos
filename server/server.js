const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// DB
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use(express.json());

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const requireFields = (body, fields) => fields.filter(
  (field) => body[field] === undefined || body[field] === null || body[field] === ''
);

const callProcedure = async (procedure, values = []) => {
  const [resultSets] = await pool.query(
    `CALL ${procedure}(${values.map(() => '?').join(', ')})`,
    values
  );
  return resultSets[0] || [];
};

app.get('/', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.get('/api/jugadores', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_consultar_jugadores');
  res.json(rows);
}));

app.post('/api/jugadores', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'alias', 'correo']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
  const rows = await callProcedure('sp_registrar_jugador', [nombre, alias, correo, fechaRegistro || null]);
  res.status(201).json(rows[0]);
}));

app.get('/api/jugadores/buscar', asyncHandler(async (req, res) => {
  const criterio = req.query.criterio;
  if (!criterio || !String(criterio).trim()) return res.status(400).json({ error: 'Debe proporcionar un criterio de búsqueda' });
  const rows = await callProcedure('sp_buscar_jugadores', [criterio]);
  res.json(rows);
}));

app.post('/api/videojuegos', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'genero']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const rows = await callProcedure('sp_registrar_videojuego', [req.body.nombre, req.body.genero]);
  res.status(201).json(rows[0]);
}));

app.get('/api/clasificacion', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_mostrar_clasificacion', [req.query.videojuego || null]);
  res.json(rows);
}));

app.get('/api/puntuaciones', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_mostrar_clasificacion', [req.query.videojuego || null]);
  res.json(rows);
}));

app.post('/api/puntuaciones', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['id_jugador', 'id_videojuego', 'puntuacion']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
  if (![jugadorId, videojuegoId, puntuacion].every((value) => Number.isInteger(Number(value)))) {
    return res.status(400).json({ error: 'Los ids y la puntuación deben ser enteros' });
  }
  const rows = await callProcedure('sp_registrar_puntuacion', [jugadorId, videojuegoId, puntuacion, fecha || null]);
  res.status(201).json(rows[0]);
}));

app.get('/api/estadisticas', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_obtener_estadisticas');
  res.json(rows[0]);
}));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(400).json({ error: err.sqlMessage || 'Error de validación en el procedimiento almacenado' });
  }
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El registro duplicado no es válido' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});