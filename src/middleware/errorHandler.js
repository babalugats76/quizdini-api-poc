const logger = require('../utils/logger.js');



function defaultHandler(err) {
  /*const status = err.status || 500;
  const errors = Array.isArray(err) ? err : [err];

    if (status === 500) {
        console.error(err.stack);
        errors = [{message: 'Internal Server Error'}];
    }

    return { status, errors }; */
  return err;
}

function handleError(err, req, res, next) {
/*  let errorHandler = ErrorHandlers[err.name] || defaultHandler;
  let { status, errors } = errorHandler(err); */
  logger.debug('Handling error', { error: err.message })
  res.status(200).json({ message: err.message });
}

module.exports = handleError;
