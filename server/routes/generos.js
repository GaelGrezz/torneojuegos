const express = require('express');
const { asyncHandler } = require('./helpers');
const { validateGenero } = require('../validators/generosValidator');
const generosController = require('../controllers/generos');

const router = express.Router();

router.get('/', asyncHandler((req, res) => generosController.getAll(req, res)));
router.post('/', validateGenero, asyncHandler((req, res) => generosController.create(req, res)));
router.put('/:id', validateGenero, asyncHandler((req, res) => generosController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => generosController.delete(req, res)));

module.exports = router;