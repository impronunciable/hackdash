
var config = require('./config.json');

if (!process.env.PORT && config.PORT){
  process.env.PORT = config.PORT;
}

require('./prerender')(config);
