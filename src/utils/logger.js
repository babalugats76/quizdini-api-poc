const winston = require('winston');
const path = require('path');

const options = {
  file: {
    level: 'info',
    filename: path.join(process.env.PWD, 'logs', 'winston.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    colorize: true,
    format: winston.format.simple()
  }
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.console));
}

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
