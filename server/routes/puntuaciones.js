const express = require('express');
const { asyncHandler } = require('./helpers');
const { validatePuntuacion } = require('../validators/puntuacionesValidator');
const puntuacionesController = require('../controllers/puntuaciones');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  await puntuacionesController.getAll(req, res);
}));

router.post('/', validatePuntuacion, asyncHandler(async (req, res) => {
  await puntuacionesController.create(req, res);
}));

module.exports = router;
