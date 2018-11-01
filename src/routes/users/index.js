const express = require('express');
const logger = require('../../utils/logger.js');
const userModel = require('../../models/user.js');
const router = express.Router();

router.get('/:username',
           findUserByUsername, 
           returnUser);

router.post('/',
           validateUser,
           createUser,
           returnUser);
 
async function findUserByUsername(req, res, next) {
  try {
    const username = req.params.username; 
    req.user = await userModel.find(username); 
    next();
  } catch(err) {
    next(err); 
  }
}

async function validateUser(req, res, next) {
  try {
    const user = req.body;
    req.user = await userModel.validate('C', user);     
    next();
  } catch(err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const user = req.user;
    req.user = await userModel.create(user);
    next();
  } catch(err) {
    next(err);
  }
}

function returnUser (req, res, next) {
  //throw(new Error('an error has occurred'));
  logger.debug('Returning user data', { user: req.user });
  res.json(req.user);   
}

module.exports = router;
