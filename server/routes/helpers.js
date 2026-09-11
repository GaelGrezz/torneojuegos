const pool = require('../config/database');

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const requireFields = (body, fields) => fields.filter(
  (field) => body[field] === undefined || body[field] === null || body[field] === ''
);

const callProcedure = async (procedure, values = []) => {
  const [resultSets] = await pool.query(
    `CALL ${procedure}(${values.map(() => '?').join(', ')})`,
    values
  );
  return resultSets[0] || [];
};

module.exports = { asyncHandler, requireFields, callProcedure };
