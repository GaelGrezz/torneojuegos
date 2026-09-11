const express = require('express');
const { asyncHandler, callProcedure } = require('./helpers');
const { validatePuntuacion } = require('../validators/puntuacionesValidator');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_mostrar_clasificacion', [req.query.videojuego || null]);
  res.json(rows);
}));

router.post('/', validatePuntuacion, asyncHandler(async (req, res) => {
  const { id_jugador: jugadorId, id_videojuego: videojuegoId, puntuacion, fecha } = req.body;
  const rows = await callProcedure('sp_registrar_puntuacion', [jugadorId, videojuegoId, puntuacion, fecha || null]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
