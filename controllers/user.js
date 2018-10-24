const userModel = require('../models/newuser');
const Validate = userModel.Validate;

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

const getByUsername = async (req, res, next) => {
  try {  
    const username = req.params.username; 
    const user = await userModel.find({ where: { username: username } });
    return sendSuccess(res, 'User found', user);
  } catch (e) { 
    return next(e); 
  }
}

const postUser = async(req, res, next) => {

  try {

    let user = await userModel
      .validate(Validate.CREATE, req.body)
      .catch(throwIf(
        e => { return e.name === 'ValidationError'; },
        400,
        e => { return e.details.map((e) => { return { message: e.message, label: e.context.label }; }); },
        'User validation error')
      );

    const { affectedRows, insertId } = await userModel
      .create(user)
      .catch(throwIf( 
        e => { return e.errno === 1062; },
        409,
        e => { return [{ message: (user.username || 'User') + ' already exists', label: 'Username' }]; },
       'User already exists'
      )      
    );

    user = await userModel.find({ where: { user_id: insertId } });
    return sendSuccess(res, 'User created', user);

  } catch (e) {
    if (e.status >= 400 && e.status < 500) {
      return sendError(res)(e);
    }
    return next(e);
  }
}

module.exports = {
  getByUsername: getByUsername,
  postUser: postUser
}
