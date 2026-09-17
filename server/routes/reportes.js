const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateVideojuegoQuery } = require('../validators/reportesValidator');
const reportesController = require('../controllers/reportes');

const router = express.Router();

router.get('/clasificacion', validateVideojuegoQuery, asyncHandler(async (req, res) => {
  await reportesController.getClassification(req, res);
}));

router.get('/estadisticas', asyncHandler(async (req, res) => {
  await reportesController.getStatistics(req, res);
}));

module.exports = router;
