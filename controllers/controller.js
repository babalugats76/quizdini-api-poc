throwError = (status, details, message) => error => {
  if (!error) error = new Error(message || 'Default Error');
  error.status = status;
  error.details = details;
  error.message = message;
  throw error;
}

throwIf = (test, status, details, message) => error => {
  if (test(error)) {
    details = details(error); 
    return throwError(status, details, message)(error);
  }
  return error;
}  

sendSuccess = (res, message, data) => {
  res.status(200).json({
    success: true, 
    message: message,
    count: data.length,
    data
  });
}

sendError = (res, status, message) => error => {
  res.status(status || error.status).json({
    success: false,
    details: error.details || '', 
    message: message || error.message, 
    error
  });
}

module.exports = { throwError, throwIf, sendSuccess, sendError };
