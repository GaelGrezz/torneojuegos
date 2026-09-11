const express = require('express');
const { asyncHandler, callProcedure } = require('./helpers');
const { validateJugador, validateBusquedaJugador } = require('../validators/jugadoresValidator');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_consultar_jugadores');
  res.json(rows);
}));

router.post('/', validateJugador, asyncHandler(async (req, res) => {
  const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
  const rows = await callProcedure('sp_registrar_jugador', [nombre, alias, correo, fechaRegistro || null]);
  res.status(201).json(rows[0]);
}));

router.get('/buscar', validateBusquedaJugador, asyncHandler(async (req, res) => {
  const criterio = req.query.criterio;
  const rows = await callProcedure('sp_buscar_jugadores', [criterio]);
  res.json(rows);
}));

module.exports = router;
