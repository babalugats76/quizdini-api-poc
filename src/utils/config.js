const logger = require('./logger');
const path = require('path');
const nconf = require('nconf');

const env = process.env.NODE_ENV || 'development';
logger.debug('nconf env', { environment: env });

const envConf = path.join(process.env.PWD, 'config', env.toLowerCase() + '.json');
logger.debug('loading env config', { config: envConf });
nconf.file(env, envConf);

const defConf = path.join(process.env.PWD, 'config', 'default.json');
logger.debug('loading default config', { config: defConf });
nconf.file('default', defConf); 

class Config {
  static get(key) { return nconf.get(key); }
}

module.exports = Config;
