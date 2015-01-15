
var config = require('../../config.test')
  , baseURL = "http://" + config.host + ":" + config.port
  , request = require('request');

require('./dataBuilder')(config);

describe('/api', function(){
  
  require('./embeds')(baseURL, config);
  
});
