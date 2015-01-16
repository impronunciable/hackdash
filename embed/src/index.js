
module.exports = (function() {
  
  if (window.hackdashEmbed){
    // already defined
    return;
  }

  window.hackdashEmbed = require('./hackdash');
  window.hackdashEmbed.jsonpCallbacks = {};

  window.hackdashEmbed.VERSION = require('../package.json').version;
  window.hackdashEmbed.config = require('../config.json');

  window.hackdashEmbed.build();

})();