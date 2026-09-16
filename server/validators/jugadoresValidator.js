const { body, query, validationResult } = require('express-validator');

const sendValidationError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fields = errors.array().map((error) => error.path);
    return res.status(400).json({ error: `Campos requeridos: ${fields.join(', ')}` });
  }

  next();
};

const validateJugador = [
  body('nombre').notEmpty(),
  body('alias').notEmpty(),
  body('correo').notEmpty().isEmail(),
  sendValidationError
];

const validateBusquedaJugador = [
  query('criterio').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Debe proporcionar un criterio de búsqueda' });
    next();
  }
];

module.exports = { validateJugador, validateBusquedaJugador };
