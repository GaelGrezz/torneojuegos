const express = require('express');
const { asyncHandler, requireFields, callProcedure } = require('./helpers');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_mostrar_clasificacion', [req.query.videojuego || null]);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['id_jugador', 'id_videojuego', 'puntuacion']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
  if (![jugadorId, videojuegoId, puntuacion].every((value) => Number.isInteger(Number(value)))) {
    return res.status(400).json({ error: 'Los ids y la puntuación deben ser enteros' });
  }
  const rows = await callProcedure('sp_registrar_puntuacion', [jugadorId, videojuegoId, puntuacion, fecha || null]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
