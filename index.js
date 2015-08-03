
/**
 * -  Expose the http server
 *
 * -  Require babel for using ES2015/16 features
 *    The optional es7.asyncFunctions optional
 *    enable the power of the awesome async/await construction
 */

require('babel/register')({optional: ['es7.asyncFunctions']});
module.exports = require('lib/server');
