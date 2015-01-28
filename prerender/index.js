
var kill = require('tree-kill');
var config = require('./config.json');

if (!process.env.PORT && config.PORT){
  process.env.PORT = config.PORT;
}

require('./prerender');

require('./fetcher')(config, function(err, fetcher){

  fetcher.fetch(function(err, result){
    if (err) console.log('fetcher error: ' + err);
    else console.log('fetcher urls cached: ' + result.urls.length);

    // Kill this process and all children
    kill(process.pid, 'SIGKILL');
  });
});
