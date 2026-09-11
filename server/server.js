const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'torneojuegos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const getId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo' });
    return null;
  }
  return id;
};

const requireFields = (body, fields) => fields.filter(
  (field) => body[field] === undefined || body[field] === null || body[field] === ''
);

app.get('/', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API del torneo de videojuegos' });
});

app.get('/api/jugadores', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM jugador ORDER BY id');
  res.json(rows);
}));

app.get('/api/jugadores/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [rows] = await pool.query('SELECT * FROM jugador WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Jugador no encontrado' });
  res.json(rows[0]);
}));

app.post('/api/jugadores', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'alias', 'correo', 'fecha_registro']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO jugador (nombre, alias, correo, fecha_registro) VALUES (?, ?, ?, ?)',
    [nombre, alias, correo, fechaRegistro]
  );
  const [rows] = await pool.query('SELECT * FROM jugador WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put('/api/jugadores/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const missing = requireFields(req.body, ['nombre', 'alias', 'correo', 'fecha_registro']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
  const [result] = await pool.execute(
    'UPDATE jugador SET nombre = ?, alias = ?, correo = ?, fecha_registro = ? WHERE id = ?',
    [nombre, alias, correo, fechaRegistro, id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Jugador no encontrado' });
  const [rows] = await pool.query('SELECT * FROM jugador WHERE id = ?', [id]);
  res.json(rows[0]);
}));

app.delete('/api/jugadores/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [result] = await pool.execute('DELETE FROM jugador WHERE id = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Jugador no encontrado' });
  res.status(204).send();
}));

app.get('/api/videojuegos', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM videojuego ORDER BY id');
  res.json(rows);
}));

app.get('/api/videojuegos/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [rows] = await pool.query('SELECT * FROM videojuego WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Videojuego no encontrado' });
  res.json(rows[0]);
}));

app.post('/api/videojuegos', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'genero']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const [result] = await pool.execute('INSERT INTO videojuego (nombre, genero) VALUES (?, ?)', [req.body.nombre, req.body.genero]);
  const [rows] = await pool.query('SELECT * FROM videojuego WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put('/api/videojuegos/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const missing = requireFields(req.body, ['nombre', 'genero']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const [result] = await pool.execute('UPDATE videojuego SET nombre = ?, genero = ? WHERE id = ?', [req.body.nombre, req.body.genero, id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Videojuego no encontrado' });
  const [rows] = await pool.query('SELECT * FROM videojuego WHERE id = ?', [id]);
  res.json(rows[0]);
}));

app.delete('/api/videojuegos/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [result] = await pool.execute('DELETE FROM videojuego WHERE id = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Videojuego no encontrado' });
  res.status(204).send();
}));

const scoreQuery = `
  SELECT p.id, p.id_jugador, j.nombre AS jugador, j.alias,
         p.id_videojuego, v.nombre AS videojuego, p.puntuacion, p.fecha
  FROM puntuacion p
  INNER JOIN jugador j ON j.id = p.id_jugador
  INNER JOIN videojuego v ON v.id = p.id_videojuego
`;

app.get('/api/puntuaciones', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${scoreQuery} ORDER BY p.fecha DESC, p.id DESC`);
  res.json(rows);
}));

app.get('/api/puntuaciones/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [rows] = await pool.query(`${scoreQuery} WHERE p.id = ?`, [id]);
  if (!rows.length) return res.status(404).json({ error: 'Puntuación no encontrada' });
  res.json(rows[0]);
}));

app.post('/api/puntuaciones', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['id_jugador', 'id_videojuego', 'puntuacion', 'fecha']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
  if (![jugadorId, videojuegoId, puntuacion].every((value) => Number.isInteger(Number(value)))) {
    return res.status(400).json({ error: 'Los ids y la puntuación deben ser enteros' });
  }
  const [result] = await pool.execute(
    'INSERT INTO puntuacion (id_jugador, id_videojuego, puntuacion, fecha) VALUES (?, ?, ?, ?)',
    [jugadorId, videojuegoId, puntuacion, fecha]
  );
  const [rows] = await pool.query(`${scoreQuery} WHERE p.id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put('/api/puntuaciones/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const missing = requireFields(req.body, ['id_jugador', 'id_videojuego', 'puntuacion', 'fecha']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
  const [result] = await pool.execute(
    'UPDATE puntuacion SET id_jugador = ?, id_videojuego = ?, puntuacion = ?, fecha = ? WHERE id = ?',
    [jugadorId, videojuegoId, puntuacion, fecha, id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Puntuación no encontrada' });
  const [rows] = await pool.query(`${scoreQuery} WHERE p.id = ?`, [id]);
  res.json(rows[0]);
}));

app.delete('/api/puntuaciones/:id', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [result] = await pool.execute('DELETE FROM puntuacion WHERE id = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Puntuación no encontrada' });
  res.status(204).send();
}));

app.get('/api/videojuegos/:id/ranking', asyncHandler(async (req, res) => {
  const id = getId(req, res);
  if (!id) return;
  const [rows] = await pool.query(`
    SELECT j.id, j.nombre, j.alias, MAX(p.puntuacion) AS mejor_puntuacion
    FROM puntuacion p
    INNER JOIN jugador j ON j.id = p.id_jugador
    WHERE p.id_videojuego = ?
    GROUP BY j.id, j.nombre, j.alias
    ORDER BY mejor_puntuacion DESC, j.alias ASC
  `, [id]);
  res.json(rows);
}));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El alias o correo ya existe' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'El jugador o videojuego indicado no existe' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});