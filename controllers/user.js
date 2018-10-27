const { throwIf, throwError, sendSuccess, sendError } = require('./controller');
const { mode, find, validate, create, update } = require('../models/user');

async function getByUsername(req, res, next) {
  try {  
    const username = req.params.username; 
    const user = await find({ where: { username: username } });
    return sendSuccess(res, 'User found', user);
  } catch (e) { 
    return next(e); 
  }
}

async function postUser(req, res, next) {
  try {
    let user = await validate(mode.CREATE, req.body)
      .catch(throwIf(
        e => { return e.name === 'ValidationError'; },
        400,
        e => { return e.details.map((e) => { return { message: e.message, label: e.context.label }; }); },
        'User validation error')
      );

    const { affectedRows, insertId } = await create(user)
      .catch(throwIf( 
        e => { return e.errno === 1062; },
        409,
        e => { return [{ message: (user.username || 'User') + ' already exists', label: 'Username' }]; },
       'User already exists'
      )      
    );

    user = await find({ where: { user_id: insertId } });
    return sendSuccess(res, 'User created', user);

  } catch (e) {
    if (e.status >= 400 && e.status < 500) {
      return sendError(res)(e);
    }
    return next(e);
  }
}
module.exports = { getByUsername, postUser }; 
