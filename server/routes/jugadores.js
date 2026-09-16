const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateJugador } = require('../validators/jugadoresValidator');
const jugadoresController = require('../controllers/jugadores');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  await jugadoresController.getAll(req, res);
}));

router.post('/', validateJugador, asyncHandler(async (req, res) => {
  await jugadoresController.create(req, res);
}));

router.put('/:id', validateJugador, asyncHandler(async (req, res) => {
  await jugadoresController.update(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await jugadoresController.delete(req, res);
}));

module.exports = router;
