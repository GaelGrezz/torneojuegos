const { body, validationResult } = require('express-validator');

const validateGenero = [
  body('nombre').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'El nombre del género es obligatorio' });
    next();
  }
];

module.exports = { validateGenero };