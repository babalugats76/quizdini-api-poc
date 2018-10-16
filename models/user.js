/**	
 * Module dependencies
 */

const md5 = require('md5'); // need for password hashing
const mysql = require('mysql'); 
const pool = require('../database').getPool();
const Joi = require('joi');

/**
 * Database Fields: user_id, username, password, title, first_name, last_name, city, state_code, country_code, email, role, is_confirmed, created_ts, last_login_ts
 */ 

const User = {
   tableName: 'user',
   selectColumns: ['user_id', 'username', 'title', 'first_name', 'last_name', 'city', 'state_code', 'country_code', 'email', 'role', 'is_confirmed', 'created_ts', 'last_login_ts'],
   orderColumn: 'last_login_ts',
   sortOrder: 'DESC',
   validateCreate: function(user, callback) {
      const createSchema = Joi.object().keys({
         username: Joi.string().max(20).label('Username'),
         password: Joi.string().min(8).max(12).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\)^&\*])/,'password').options({ language: { string: { regex: { base: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*', name: '!!Password is not complex enough; must contain a lowercase letter, uppercase letter, digit and special characters, i.e., !@#$%)^&*' } } } }).label('Password'),
         confirm_password: Joi.string().strip().valid(Joi.ref('password')).options({ language: { any: { allowOnly: '!!Passwords do not match' } } }).label('Confirm Password'),
         title: Joi.string().max(10).label('Title'),
         first_name: Joi.string().max(40).label('First Name'),
         last_name: Joi.string().max(60).label('Last Name'), 
         city: Joi.string().max(100).optional().label('City'),
         state_code: Joi.string().max(2).optional().label('State Code'),
         country_code: Joi.string().max(2).optional().label('Country Code'),
         email: Joi.string().max(100).email().label('Email')
      });
      Joi.validate(user, createSchema, { abortEarly: true, presence: 'required', escapeHtml: true }, (err, value) => {  
         if (err) return callback(err);
         return callback(null, value); 
      });
   },  
   validateUpdate: function(user, callback) {
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
      Joi.validate(user, updateSchema, { abortEarly: false, presence: 'optional', escapeHtml: true }, (err, value) => {
         if (err) return callback(err); 
         return callback(null, value); 
      });
   },
   create: async function(user, callback) {
      try { // async functions need this to handle potential promise rejection
         (user.username ? user.username = user.username.toLowerCase() : "")  ;
         (user.password ? user.password = md5(user.password) : "");
         (user.confirm_password ? delete user.confirm_password : "");
         user.role = 'teach';
         user.is_confirmed = 'N';
         user.created_ts = mysql.raw('CURRENT_TIMESTAMP()'); 
         return await pool.query('INSERT INTO ?? SET ?', [this.tableName, user], callback); 
      } catch (err) {
         return callback(err, null);
      } 
   },
   update: async function(user, callback) {
      try { 
         (user.username ? user.username = user.username.toLowerCase() : ""); 
         (user.password ? user.password = md5(user.password) : "");
         (user.confirm_password ? delete user.confirm_password : "");
         (user.last_login_ts ? user.last_login_ts = mysql.raw('CURRENT_TIMESTAMP()') : ""); 
         return await pool.query('UPDATE ?? SET ? WHERE `user_id` = ? LIMIT 1', [this.tableName, user, user.user_id], callback);
      } catch (err) {
         return callback(err, null); 
      }
   },
   getAll: async function(limit, offset, callback){
      try {
         return await pool.query('SELECT ?? FROM ?? ORDER BY ?? ? LIMIT ? OFFSET ?', [this.selectColumns, this.tableName, this.orderColumn, mysql.raw(this.sortOrder), limit, offset], callback);
      } catch (err) {
         return callback(err, null);
      }
   },
   getById: async function(userId, callback) {
      try {
         return await pool.query('SELECT ?? FROM ?? WHERE `user_id` = ? LIMIT 1', [this.selectColumns, this.tableName, userId], callback);
     } catch (err) {
        return callback(err, null); 
     }
   },
   getByUsername: async function(username, callback){
      try {
         return await pool.query('SELECT ?? FROM ?? WHERE `username` = ? LIMIT 1', [this.selectColumns, this.tableName, username.toLowerCase()], callback); 
      } catch (err) {
         return callback(err, null);
      }
   }
};

module.exports=User;
