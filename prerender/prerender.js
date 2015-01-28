
// More Info at https://prerender.io/server

var prerender = require('prerender');
var config = require('./config.json');

if (!process.env.PORT && config.PORT){
  process.env.PORT = config.PORT;
}

var server = prerender({
  //number of phantomjs processes to start
  workers: config.WORKERS || 1,

  //number of requests to server before restarting phantomjs
  iterations: config.ITERATIONS || 1,

  //arguments passed into each phantomjs process
  phantomArguments: [
    "--load-images=false",
    "--ignore-ssl-errors=true"
  ]
});

server.use(require('./cache.js')(config));
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
