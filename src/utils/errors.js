class CustomError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class UnauthorizedError extends CustomError {
  constructor(reason, err) {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
    this.reason = reason;
    this.statusCode = 401;
    this.err = err;
    Error.captureStackTrace(this);
  }
}

class ValidationError extends CustomError {
 
  constructor(reason, err) {
    super('Bad Request'); 
    this.name = 'ValidationError';
    this.reason = reason;
    this.statusCode = 400;
    this.err = err;
    Error.captureStackTrace(this);
  }

  get details() {
    return this.err.details.map((e) => { return { field: e.context.label, message: e.message }; });
  }

}

class DuplicateError extends CustomError {

  constructor(reason, err) {
    super('Conflict');
    this.name = 'DuplicationError';
    this.reason = reason;
    this.statusCode = 409; 
    this.err = err; 
    Error.captureStackTrace(this);    
  }

}

module.exports = {
  UnauthorizedError,
  ValidationError,
  DuplicateError
}
