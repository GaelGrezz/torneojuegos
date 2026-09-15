const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateJugador, validateBusquedaJugador } = require('../validators/jugadoresValidator');
const jugadoresController = require('../controllers/jugadores');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  await jugadoresController.getAll(req, res);
}));

router.post('/', validateJugador, asyncHandler(async (req, res) => {
  await jugadoresController.create(req, res);
}));

router.get('/buscar', validateBusquedaJugador, asyncHandler(async (req, res) => {
  await jugadoresController.search(req, res);
}));

module.exports = router;
