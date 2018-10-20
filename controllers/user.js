const casing = require('change-case');
const userModel = require('../models/user');
const newUserModel = require('../models/newuser');

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
   for (i=0; i < obj.length; i++) {
       a.push(map(obj[i], casing.camel));
   }
   //return JSON.parse(JSON.stringify(a));
   return a;
}

const respond = (res, code, ret) => {
   return res.status(code).json(ret); 
}

const failure = (reason, next) => {
   console.log('inside failure...');
   return next(new Error(reason));
}

const getById = (req, res, next) => {
   let users = [];
   const id = req.params.userId; 
   newUserModel.findById(id)
   .then(results => format(results, users))
   .then(users => {
       console.log("Length of users: " + users.length);
       const success = (users.length === 1 ? true : false); 
       const message = (users.length > 1 ? "Users Found" : (users.length === 1 ? "User Found" : "User Not Found")); 
       const count = users.length; 
       let ret = {"success": success, "message": message, "count": count, "users": users }  
       return respond(res, 200, ret);
    })
   .catch(reason => failure(reason, next))  
}

const getByUsername = async (req, res, next) => {
   const username = req.params.username; 
   try {  
      const user = await newUserModel.findByUsername(username);
      let users = format(user);
      const success = (users.length === 1 ? true : false);
      const message = (users.length > 1 ? "Users Found" : (users.length === 1 ? "User Found" : "User Not Found"));
      const count = users.length;
      const payload = Object.assign({count: users.length, success: success, message: message},{users: users}); 
      respond(res, 200, payload); 
   } catch (err) {
      next(err);  
   }
}

function postUser(req, res, next) {
   console.log(req.body); 
   let user = req.body;
   let users = [];
   let errors = [];
   map(user, casing.snake);
   userModel.validateCreate(user, function(err, results) { // Validate 
      if (err) {
         for (i = 0; i < err.details.length; i++) {
            errors.push({"message": err.details[i].message, "label": err.details[i].context.label}); 
         }
         return res.status(400).json({"name": err.name, "details": errors});
      } 
      user = results; // User (post-validation)
      userModel.create(user, function(err, results) { // Create
         if (err) return next(err);  
         if (results.affectedRows == 1) {
            const userId = results['insertId'];
            userModel.getById(userId, function(err, results) { // Query, Map, and Return
               if (err) return next(err); 
               map(results[0], casing.camel);
               users.push(results[0]);
               return res.json({"users": users, "rowCount": users.length});    
            });   
         } else {
            return res.json({"users": users, "rowCount": users.length});    
         }
      }); 
  });
} 

function putUser(req, res, next) {
   console.log(req.body); 
   let user = req.body;
   let users = [];
   let errors = [];
   map(user, casing.snake); 
   userModel.validateUpdate(user, function(err, results) { // Validate
      if (err) {
         for (i = 0; i < err.details.length; i++) {
            errors.push({"message": err.details[i].message, "label": err.details[i].context.label}); 
         }
         return res.status(400).json({"name": err.name, "details": errors});
      } 
      user = results; // User (post-validation)
      userModel.update(user, function(err, results) { // Update
         if (err) return next(err);  
         if (results.affectedRows == 1) { 
            userModel.getByUsername(user.username, function(err, results) { // Query, Map, and Return
               if (err) return next(err); 
               map(results[0], casing.camel);
               users.push(results[0]);
               return res.json({"users": users, "rowCount": users.length});    
            });   
         } else { // Valid request, but no record found (to update)
            return res.json({"users": users, "rowCount": users.length});    
         }
      }); 
   }); 
}
  
function getUsers(req, res, next) {
   let users = [];
   const limit = (req.query.limit ? parseInt(req.query.limit) : 20 );
   const offset = (req.query.offset ? parseInt(req.query.offset) : 0 );
   userModel.getAll(limit, offset, function(err, results) {
      if (err) return next(err);
      for (i=0; i < results.length; i++) {
         map(results[i], casing.camel); 
         users.push(results[i]);
      }
      return res.json({"users": users, "rowCount": users.length, "limit": limit, "offset": offset});
   });
}

module.exports = {
   postUser: postUser,
   putUser: putUser,
   getUsers: getUsers,
   getById: getById,
   getByUsername: getByUsername
}

