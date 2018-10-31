const logger = require('../utils/logger.js');
const { query } = require('../utils/db.js');

const entity = 'user';

async function find(username) {
  logger.debug('Preparing find SQL', { username: username });
  const sql = 'SELECT * FROM ?? WHERE `username` = ? LIMIT 1';
  logger.debug('Issuing SQL', { sql: sql } );
  return await query(sql, [entity, username]);  
} 

module.exports = { 
  find 
};
