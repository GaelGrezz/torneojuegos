const { body, validationResult } = require('express-validator');

const validateVideojuego = [
  body('nombre').notEmpty(),
  body('genero').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const fields = errors.array().map((error) => error.path);
      return res.status(400).json({ error: `Campos requeridos: ${fields.join(', ')}` });
    }
    next();
  }
];

module.exports = { validateVideojuego };
