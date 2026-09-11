const express = require('express');
const { asyncHandler, callProcedure } = require('./helpers');
const { validateVideojuegoQuery } = require('../validators/reportesValidator');

const router = express.Router();

router.get('/clasificacion', validateVideojuegoQuery, asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_mostrar_clasificacion', [req.query.videojuego || null]);
  res.json(rows);
}));

router.get('/estadisticas', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_obtener_estadisticas');
  res.json(rows[0]);
}));

module.exports = router;
