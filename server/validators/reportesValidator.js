const { query, validationResult } = require('express-validator');

const validateVideojuegoQuery = [
  query('id_videojuego').optional().isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'El id_videojuego debe ser un entero positivo' });
    }
    next();
  }
];

module.exports = { validateVideojuegoQuery };
