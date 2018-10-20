/**
 * Module dependencies 
 */

const md5 = require('md5');
const mysql = require('mysql');
const db = require('../db');
const Joi = require('joi');
const casing = require('change-case');

/*
 * Helper functions
 */

const map = (obj, fn) => {
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
      a.push(map(obj[i], casing.camel));
   }
   return a;
}

/*
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

const table = 'user';
const columns = [
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
   'last_login_ts',
];
const orderBy: 'last_login_ts';
const sortOrder: 'DESC';

/*
 * Validation objects 
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
   password: Joi.string().min(8).max(12).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\)^&\*])/,'password').options({ language: { string: { regex: { base: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*', name: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*' } } } }).label('Password'),
   confirm_password: Joi.string().valid(Joi.ref('password')).options({ language: { any: { allowOnly: '!!Passwords do not match' } } }).label('Confirm Password'),
   title: Joi.string().max(10).label('Title'),
   first_name: Joi.string().max(40).label('First Name'),
   last_name: Joi.string().max(60).label('Last Name'), 
   city: Joi.string().max(100).label('City'),
   state_code: Joi.string().max(2).label('State Code'),
   country_code: Joi.string().max(2).label('Country Code'),
   email: Joi.string().max(100).email().label('Email'),
   role: Joi.string().valid(['teach','admin']).label('Role'),
   is_confirmed: Joi.string().valid('Y','N').label('Email Validated'),
   created_ts: Joi.date().strip().label('Created Date'),
   last_login_ts: Joi.date().label('Last Updated')
 }).and('password','confirm_password').options({ language: { object: { and: '!!Both Password and Confirm Password must be provided' } } });

const validate = async (user, schema, options) => {
   // Consider passing presence: 'optional' for update validation 
   if (options) Object.assign({ abortEarly: true, presence: 'required', escapeHtml: true }, options);
   return await Joi.validate(user, createSchema, options);
} 

const create = async (user) => {
   (user.username ? user.username = user.username.toLowerCase() : "")  ;
   (user.password ? user.password = md5(user.password) : "");
   (user.confirm_password ? delete user.confirm_password : "");
   user.role = 'teach';
   user.is_confirmed = 'N'; 
   user.created_ts = mysql.raw('CURRENT_TIMESTAMP()'); 
   return await db.query('INSERT INTO ?? SET ??', [table, user]);
}

const update = async (user) =>  {
   (user.username ? user.username = user.username.toLowerCase() : ""); 
   (user.password ? user.password = md5(user.password) : "");
   (user.confirm_password ? delete user.confirm_password : "");
   (user.last_login_ts ? user.last_login_ts = mysql.raw('CURRENT_TIMESTAMP()') : ""); 
   return await db.query('UPDATE ?? SET ? WHERE `user_id` = ? LIMIT 1', [table, user, user.user_id]);
}

const findById = async (userId) => {
   return await db.query('SELECT ?? FROM ?? WHERE `user_id` = ? LIMIT 1', [columns, table, user_id]); 
}

const findByUsername = async (username) => {
   return await db.query('SELECT ?? FROM ?? WHERE `username` = ? LIMIT 1', [columns, table, username]);
}  

const getAll = async (limit, offset) => {
   return await db.query('SELECT ?? FROM ?? ORDER BY ?? ? LIMIT ? OFFSET ?', [columns, table, orderBy, mysql.raw(sortOrder), limit, offset]);
}

module.exports = { 
   create: create,
   update: update,
   findById: findById, 
   findByUsername: findByUsername,
   getAll: getAll
}
