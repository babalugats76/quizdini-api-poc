//const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
require('./utils/passport');
const logger = require('./utils/logger.js');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler'); 
const app = express();

// enable CORS and other middleware 
app.use(cors());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(passport.initialize());
app.use('/v1', routes);
app.use(errorHandler);

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  //res.status(err.status || 500);
  res.status(500).json({message: err.message});
});
*/
module.exports = app;
