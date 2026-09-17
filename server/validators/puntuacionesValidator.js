const { body, validationResult } = require('express-validator');

const validatePuntuacion = [
  body('id_jugador').notEmpty().withMessage('required').bail().isInt().withMessage('integer'),
  body('id_videojuego').notEmpty().withMessage('required').bail().isInt().withMessage('integer'),
  body('puntuacion').notEmpty().withMessage('required').bail().isInt().withMessage('integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const missing = errors.array().filter((error) => error.msg === 'required');
      if (missing.length) {
        return res.status(400).json({ error: `Campos requeridos: ${missing.map((error) => error.path).join(', ')}` });
      }
      return res.status(400).json({ error: 'Los ids y la puntuación deben ser enteros' });
    }
    next();
  }
];

const validatePuntuacionUpdate = [
  body('puntuacion').notEmpty().withMessage('required').bail().isInt().withMessage('integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const missing = errors.array().filter((error) => error.msg === 'required');
      if (missing.length) {
        return res.status(400).json({ error: `Campos requeridos: ${missing.map((error) => error.path).join(', ')}` });
      }
      return res.status(400).json({ error: 'La puntuación debe ser un entero' });
    }
    next();
  }
];

module.exports = { validatePuntuacion, validatePuntuacionUpdate };
