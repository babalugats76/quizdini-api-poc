/** 
 *  * Module dependencies.
 *   */

const util = require('util');
const mysql = require('mysql');

const dbconfig = {
   'host': process.env.DB_HOST,
   'port': process.env.DB_PORT,
   'user': process.env.DB_USER,
   'password': process.env.DB_PASSWORD,
   'database': process.env.DB_NAME,
   'connectionLimit': process.env.DB_POOL_LIMIT
}

let pool = undefined;

/**
 *  * Create database connection pool
 *   */

module.exports = {
   getPool: function() {
      if (pool) return pool;
      pool = mysql.createPool(dbconfig);
      pool.query = util.promisify(pool.query);
      console.log("New pool created!");
      pool.on('acquire', function (connection) {
        console.log('Connection %d acquired', connection.threadId);
      });
      return pool;
   }
};
