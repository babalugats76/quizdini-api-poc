const express = require('express');
const jwt = require('jsonwebtoken'); 
const passport = require('passport'); 
const logger = require('../../utils/logger.js');
const { UnauthorizedError } = require('../../utils/errors.js');
//const userModel = require('../../models/user.js');
const router = express.Router();

router.post('/login', authenticate);  

async function authenticate(req, res, next) {
  logger.debug('authenticating', { body: req.body });
  try {
    await passport.authenticate('local', { session: false }, (err, user, info) => {
      logger.debug('processing authentication response', {err, user, info}); 
      if (err || info || !user) return(next(new UnauthorizedError(info || 'Wrong Credentials', err || undefined)));
      if (user) {
        logger.debug('authentication successful');
        // return webtoken here
        return res.json({ message: "success", user});    
      }
      next();
    })(req, res);
  } catch (err) {
    next(err); 
  }
}

module.exports = router;
