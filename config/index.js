
/**
 * Expose the configuration. Uses the test config if NODE_ENV env setting
 * is set as 'test'. Otherwise it uses the default config file
 */
require('dotenv').config()
import config from './config.js';
import testConfig from './config.test.js';

export default process.env.NODE_ENV === 'test' ? testConfig : config;
