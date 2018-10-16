const changeCase = require('change-case');
const userModel = require('../models/user');

function mapKeys(obj,f) {
   for (let key in obj) {
      if (obj.hasOwnProperty(key) && (f(key) !== key)) {
         obj[f(key)] = obj[key];
         delete obj[key];
      }
   }
}

function postUser(req, res, next) {
   console.log(req.body); 
   let user = req.body;
   let users = [];
   let errors = [];
   mapKeys(user, changeCase.snake);
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
               mapKeys(results[0], changeCase.camel);
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
   mapKeys(user, changeCase.snake); 
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
               mapKeys(results[0], changeCase.camel);
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
         mapKeys(results[i], changeCase.camel); 
         users.push(results[i]);
      }
      return res.json({"users": users, "rowCount": users.length, "limit": limit, "offset": offset});
   });
}

function getUserByUsername(req, res, next) {
   let users = [];
   let username = req.params.username; 
   userModel.getByUsername(username, function(err, results) {
      if (err) return next(err); 
      if (results[0]) { 
         mapKeys(results[0], changeCase.camel);
         users.push(results[0]);
      }
      return res.json({"users": users, "rowCount": users.length});
   }); 
}

module.exports = {
   postUser: postUser,
   putUser: putUser,
   getUsers: getUsers,
   getUserByUsername: getUserByUsername  
}
