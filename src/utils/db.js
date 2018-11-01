const config = require('./config'); 
const logger = require('./logger');
const mysql = require('mysql');
const Promise = require('bluebird');

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

logger.debug('Configuring database config', {config: config.get('db') }); 

const dbconfig = {
  'host': config.get('db:host'),
  'port': config.get('db:port'),
  'user': config.get('db:user'),
  'password': config.get('db:password'),
  'database': config.get('db:database'),
  'connectionLimit': config.get('db:poolLimit')
}

let pool = Promise.promisifyAll(mysql.createPool(dbconfig));

pool.on('acquire', (connection) => {
  logger.debug('Acquired connection', { threadId: connection.threadId });
});

const getConnection = exports.getConnection = () => {
  return pool.getConnectionAsync().disposer((connection) => {
    try {
      logger.debug('Releasing connection', { threadId:  connection.threadId });
      connection.release();
    } catch (e) {};
  });
}

const query = exports.query = (sql, placeholders) => {
  return Promise.using(getConnection(), (connection) => {
    return Promise.promisify(connection.query, {
      context: connection
    })(sql, placeholders);
  });
}
