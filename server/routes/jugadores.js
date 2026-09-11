const express = require('express');
const { asyncHandler, requireFields, callProcedure } = require('./helpers');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_consultar_jugadores');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'alias', 'correo']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const { nombre, alias, correo, fecha_registro: fechaRegistro } = req.body;
  const rows = await callProcedure('sp_registrar_jugador', [nombre, alias, correo, fechaRegistro || null]);
  res.status(201).json(rows[0]);
}));

router.get('/buscar', asyncHandler(async (req, res) => {
  const criterio = req.query.criterio;
  if (!criterio || !String(criterio).trim()) return res.status(400).json({ error: 'Debe proporcionar un criterio de búsqueda' });
  const rows = await callProcedure('sp_buscar_jugadores', [criterio]);
  res.json(rows);
}));

module.exports = router;
