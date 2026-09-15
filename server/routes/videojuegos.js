const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateVideojuego } = require('../validators/videojuegosValidator');
const videojuegosController = require('../controllers/videojuegos');

const router = express.Router();

router.post('/', validateVideojuego, asyncHandler(async (req, res) => {
  await videojuegosController.create(req, res);
}));

module.exports = router;
