/**
 * Module dependencies. 
 */
const md5 = require('md5');
const mysql = require('mysql');
const db = require('../db');
const Joi = require('joi');
const casing = require('change-case');

const CAMEL = casing.camel;
const SNAKE = casing.snake;

/**
 * Table: user 
 * 
 * Database Fields: 
 *    user_id, 
 *    username, 
 *    password, 
 *    title, 
 *    first_name, 
 *    last_name, 
 *    city, 
 *    state_code, 
 *    country_code, 
 *    email, 
 *    role, 
 *    is_confirmed, 
 *    created_ts, 
 *    last_login_ts
 */
const entity = 'user';

/**
 * Validation objects. 
 */
const createSchema = Joi.object().keys({
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

const updateSchema = Joi.object().keys({
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

/**
 * Helper functions
 */
const renameKeys = (obj, fn) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && (fn(key) !== key)) {
      obj[fn(key)] = obj[key];
      delete obj[key];
    }
  }
  return obj;
}

const format = (obj) => {
  a = [];
  for (i = 0; i < obj.length; i++) {
    a.push(renameKeys(obj[i], CAMEL));
  }
  return a;
}

/**
 * Supported validation types.
 * @enum {string} 
 */

const Validate = {
  CREATE: 'create',
  UPDATE: 'update'
};

validateOpts = {
  create: {
    schema: createSchema,
    options: {
      abortEarly: true,
      presence: 'required',
      escapeHtml: true 
    },
  },
  update: {
    schema: updateSchema,
    options: {
      abortEarly: true,
      presence: 'optional',
      escapeHtml: true
    }
  }
}

/**
 * Generic validation wrapper.
 *
 * Examples:
 *   const results = validate(Validate.CREATE, user)
 *   const results = validate(Validate.UPDATE, user)  
 */
const validate = async(type, user) => {
   user = renameKeys(user, SNAKE);
   return await Joi.validate(user, validateOpts[type].schema, validateOpts[type].options); 
}

/**
 * Create user. 
 *
 * Assumes JSON validation and key mapping, i.e., camel to snake
 * Certain object transformations happen ahead of time, e.g., add role
 *
 */
const create = async(user) => {
  (user.username ? user.username = user.username.toLowerCase() : '');
  (user.password ? user.password = md5(user.password) : '');
  (user.confirm_password ? delete user.confirm_password : '');
  user.role = 'teach';
  user.is_confirmed = 'N';
  user.created_ts = mysql.raw('CURRENT_TIMESTAMP()');
  return await db.query('INSERT INTO ?? SET ?', [entity, user]);
}

const update = async(user) => {
  (user.username ? user.username = user.username.toLowerCase() : '');
  (user.password ? user.password = md5(user.password) : '');
  (user.confirm_password ? delete user.confirm_password : '');
  (user.last_login_ts ? user.last_login_ts = mysql.raw('CURRENT_TIMESTAMP()') : '');
  const results = await db.query('UPDATE ?? SET ? WHERE `user_id` = ? LIMIT 1', [entity, user, user.user_id]);
  return format(results); 
}

/**
 * Generic query method 
 */
const find = async(options) => {

  const o = {
    columns: [
      'user_id',
      'username',
      'title',
      'first_name',
      'last_name',
      'city',
      'state_code',
      'country_code',
      'email',
      'role',
      'is_confirmed',
      'created_ts',
      'last_login_ts'
    ],
    limit: 1
  };

  const opt = Object.assign(o,options);
  
  let sql = 'SELECT ?? FROM ??'; 
  let ph = [opt.columns, entity];

  (opt.where ? (sql += ' WHERE ?', opt.where = renameKeys(opt.where, SNAKE), ph.push(opt.where)) : '');
  (opt.order ? (sql += ' ORDER BY ??', ph.push(opt.order), (opt.sort ? (sql += ' ?', ph.push(mysql.raw(opt.sort))) : '' )) : ''); 
  (opt.limit ? (sql += ' LIMIT ?', ph.push(opt.limit)) : ''); 
  (opt.offset ? (sql += ' OFFSET ?', ph.push(opt.offset)) : ''); 

  console.log('OPTIONS', opt);
  console.log('SQL', sql);
  console.log('PH', ph); 
  const results = await db.query(sql, ph);
  return format(results); 
}

module.exports = {
  Validate: Validate,
  validate: validate,
  find: find,
  create: create,
  update: update
};
