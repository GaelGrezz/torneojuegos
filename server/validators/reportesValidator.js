const { query, validationResult } = require('express-validator');

const validateVideojuegoQuery = [
  query('videojuego').optional().trim().notEmpty(),
  (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: 'El videojuego no puede estar vacío' });
    }
    next();
  }
];

module.exports = { validateVideojuegoQuery };
