const logger = require('../utils/logger.js');

function handleError(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.reason || err.message || 'Internal Server Error';
  const details = err.details || undefined;
  res.status(statusCode).json({ "error": { statusCode, message, details } }); 
}

module.exports = handleError;
