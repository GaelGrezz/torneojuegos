const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateVideojuego } = require('../validators/videojuegosValidator');
const videojuegosController = require('../controllers/videojuegos');

const router = express.Router();

router.post('/', validateVideojuego, asyncHandler(async (req, res) => {
  await videojuegosController.create(req, res);
}));

router.get('/', asyncHandler(async (req, res) => {
  await videojuegosController.getAll(req, res);
}));

router.put('/:id', validateVideojuego, asyncHandler(async (req, res) => {
  await videojuegosController.update(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await videojuegosController.delete(req, res);
}));

module.exports = router;
