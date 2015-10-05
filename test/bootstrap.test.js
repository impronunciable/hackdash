
require('babel/register');

var app = require('lib/server');
var http = require('http');

before(function(done) {

  server = http.createServer(app);

  var port = +process.env.PORT || 9999;
  app.set('port', port);

  server.listen(port);

  server.on('error', function(error){
    throw error;
    done(error);
  });

  server.on('listening', function(){
    done();
  });

  global.server = server;
});

after(function(done) {
  global.server.close();
  done();
});
