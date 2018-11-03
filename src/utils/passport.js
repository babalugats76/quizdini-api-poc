
const config = require('./config');
const logger = require('./logger');
const passport = require('passport');
const { UnauthorizedError } = require('./errors'); 
const { verifyPassword } = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

const secret = config.get('jwt:secret');
logger.debug('adding JWT passport strategy', {secret: secret});

async function verifyCredentials(username, password, done) {
  logger.debug('verifycredentials called...');
  logger.debug('verifying credentials', { username, password });
//  logger.debug(done);
//  return done(new UnauthorizedError('Missing Credentials')); 
  const user = await verifyPassword(username, password);
  if (!user) return done(null, false);
  return done(null, user); 
}

logger.debug('loading local Passport strategy');
passport.use(new LocalStrategy( { 'usernameField': 'username', 'passwordField': 'password' }, verifyCredentials));
