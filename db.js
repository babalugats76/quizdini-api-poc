const mysql = require('mysql');
const Promise = require('bluebird'); 
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

const dbconfig = {
   'host': process.env.DB_HOST,
   'port': process.env.DB_PORT,
   'user': process.env.DB_USER,
   'password': process.env.DB_PASSWORD,
   'database': process.env.DB_NAME,
   'connectionLimit': process.env.DB_POOL_LIMIT
}

let pool = Promise.promisifyAll(mysql.createPool(dbconfig));

pool.on('acquire', (connection) => { 
   console.log('connection %d', connection.threadId); 
}); 

const getConnection = exports.getConnection = () => {
   return pool.getConnectionAsync().disposer((connection) => {
      try {
         console.log('releasing connection');
         connection.release();
      } catch(e) {};
   });
}

const query = exports.query = (sql, placeholders) => {
   return Promise.using(getConnection(), (connection) => {
      return Promise.promisify(connection.query, {context: connection})(sql, placeholders);
   });
}
