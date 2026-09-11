const express = require('express');
const { asyncHandler, callProcedure } = require('./helpers');
const { validateVideojuego } = require('../validators/videojuegosValidator');

const router = express.Router();

router.post('/', validateVideojuego, asyncHandler(async (req, res) => {
  const rows = await callProcedure('sp_registrar_videojuego', [req.body.nombre, req.body.genero]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
