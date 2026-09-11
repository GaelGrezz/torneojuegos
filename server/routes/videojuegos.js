const express = require('express');
const { asyncHandler, requireFields, callProcedure } = require('./helpers');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ['nombre', 'genero']);
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
  const rows = await callProcedure('sp_registrar_videojuego', [req.body.nombre, req.body.genero]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
