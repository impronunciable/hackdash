
/**
 * Expose the configuration. Uses the test config if NODE_ENV env setting
 * is set as 'test'. Otherwise it uses the default config file
 */

import config from './config.json';
import testConfig from './config.test.json';

if(process.env.NODE_ENV === 'test') {
  export default testConfig;
} else {
  export default config;
}
