
var config = require('../../config.test')
  , baseURL = "http://" + config.host + ":" + config.port
  , baseAPI = baseURL + "/api/v2"
  , request = require('request');

var dataBuilder = require('./dataBuilder')(config);

var userAuthA = { auth: { user: 'testa', pass: "x" } };
var userAuthB = { auth: { user: 'testb', pass: "x" } };

describe('/api', function(){

  before(function(done){
    dataBuilder.clearAll(function(){
      createUsers(done);
    });
  });

  after(function(done){
    dataBuilder.dropDatabase(done);
  });

  require('./embeds')(baseAPI, config, [ userAuthA, userAuthB ]);
  require('./users')(baseAPI, config, [ userAuthA, userAuthB ]);
  require('./profiles')(baseAPI, config, [ userAuthA, userAuthB ]);

});

function createUsers(done){

  dataBuilder.create('User', [
    { name: 'User Auth A', provider: 'basic', provider_id: 1, username: 'testa' },
    { name: 'User Auth B', provider: 'basic', provider_id: 1, username: 'testb' }
  ], function(err, users){
    userAuthA._id = users[0]._id;
    userAuthB._id = users[1]._id;
    done();
  });

}
