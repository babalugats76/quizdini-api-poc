const logger = require('../utils/logger.js');
const mysql = require('mysql');
const md5 = require('md5');
const Joi = require('joi');
const casing = require('change-case');
const { query } = require('../utils/db.js');

const CAMEL = casing.camel;
const SNAKE = casing.snake;

const entity = 'user';

const mode = {
  CREATE: 'C',
  UPDATE: 'U'
};

let createSchema = Joi.object().keys({
  username: Joi.string().max(20).label('Username'),
  password: Joi.string().min(8).max(12).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\)^&\*])/, 'password').options({
    language: {
      string: {
        regex: {
          base: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*',
          name: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*'
        }
      }
    }
  }).label('Password'),
  confirm_password: Joi.string().strip().valid(Joi.ref('password')).options({
    language: {
      any: {
        allowOnly: '!!Passwords do not match'
      }
    }
  }).label('Confirm Password'),
  title: Joi.string().max(10).label('Title'),
  first_name: Joi.string().max(40).label('First Name'),
  last_name: Joi.string().max(60).label('Last Name'),
  city: Joi.string().max(100).optional().label('City'),
  state_code: Joi.string().max(2).optional().label('State Code'),
  country_code: Joi.string().max(2).optional().label('Country Code'),
  email: Joi.string().max(100).email().label('Email')
});

let updateSchema = Joi.object().keys({
  user_id: Joi.number().integer().label('User Id'),
  username: Joi.string().max(20).required().label('Username'),
  password: Joi.string().min(8).max(12).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\)^&\*])/, 'password').options({
    language: {
      string: {
        regex: {
          base: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*',
          name: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*'
        }
      }
    }
  }).label('Password'),
  confirm_password: Joi.string().valid(Joi.ref('password')).options({
    language: {
      any: {
        allowOnly: '!!Passwords do not match'
      }
    }
  }).label('Confirm Password'),
  title: Joi.string().max(10).label('Title'),
  first_name: Joi.string().max(40).label('First Name'),
  last_name: Joi.string().max(60).label('Last Name'),
  city: Joi.string().max(100).label('City'),
  state_code: Joi.string().max(2).label('State Code'),
  country_code: Joi.string().max(2).label('Country Code'),
  email: Joi.string().max(100).email().label('Email'),
  role: Joi.string().valid(['teach', 'admin']).label('Role'),
  is_confirmed: Joi.string().valid('Y', 'N').label('Email Validated'),
  created_ts: Joi.date().strip().label('Created Date'),
  last_login_ts: Joi.date().label('Last Updated')
}).and('password', 'confirm_password').options({
  language: {
    object: {
      and: '!!Both Password and Confirm Password must be provided'
    }
  }
});

let joiOpts = {
  'C': {
    schema: createSchema,
    options: {
      abortEarly: false,
      presence: 'required',
      escapeHtml: true 
    },
  },
  'U': {
    schema: updateSchema,
    options: {
      abortEarly: true,
      presence: 'optional',
      escapeHtml: true
    }
  }
};

/**
 *  * Helper functions
 *   */
function renameKeys(obj, fn) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && (fn(key) !== key)) {
      obj[fn(key)] = obj[key];
      delete obj[key];
    }
  }
  return obj;
}

function format(obj) {
  a = [];
  for (i = 0; i < obj.length; i++) {
    a.push(renameKeys(obj[i], CAMEL));
  }
  return a;
}

async function validate(mode, user) {
  logger.debug('transforming user keys', { user: user }); 
  user = renameKeys(user, SNAKE);
  logger.debug('Validating user', { mode: mode, user: user }); 
  return await Joi.validate(user, joiOpts[mode].schema, joiOpts[mode].options); 
}

async function find(username) {
  logger.debug('Preparing find SQL', { username: username });
  const sql = 'SELECT * FROM ?? WHERE `username` = ? LIMIT 1';
  logger.debug('Issuing SQL', { sql: sql } );
  return await query(sql, [entity, username]);  
} 

async function create(user) {
  logger.debug('Preparing create SQL', { user: user }); 
  (user.username ? user.username = user.username.toLowerCase() : '');
  (user.password ? user.password = md5(user.password) : '');
  (user.confirm_password ? delete user.confirm_password : '');
  user.role = 'teach';
  user.is_confirmed = 'N';
  user.created_ts = mysql.raw('CURRENT_TIMESTAMP()');
  const sql = 'INSERT INTO ?? SET ?';
  logger.debug('Issuing SQL', { sql: sql });
  return await query(sql, [entity, user]);
}

module.exports = { 
  validate,
  find,
  create 
};
