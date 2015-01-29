
var kill = require('tree-kill');
var config = require('./config.json');

if (!process.env.PORT && config.PORT){
  process.env.PORT = config.PORT;
}

console.log('Starting Prerender..');

require('./prerender');

console.log('Starting Fetcher..');

setTimeout(function(){
  require('./fetcher')(config, function(err, fetcher){

    fetcher.fetch(function(err, result){
      if (err) console.log('fetcher error: ' + err);
      else console.log('fetcher urls cached: ' + result.urls.length);

      console.log('Killing tree..');

      setTimeout(function(){
        // Kill this process and all children
        kill(process.pid, 'SIGKILL');
      }, 2000);
    });
  });
}, 2000);
