var redis = require('redis');

var client = redis.createClient();

client.keys('hhba:*', function(err, keys){
  client.del(keys);
});
