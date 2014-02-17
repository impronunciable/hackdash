
/*
 * Fix made to replace all user on db which has a picture profile from twitter
 * Replaces subdomain "si0.twimg.com" by "pbs.twimg.com"
 */

var 
    config = require('../config.json')
  , mongoose = require('mongoose');

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('../models')({
  get: function(){
    return ['brainstorming','wireframing','building','researching','prototyping','releasing'];
  }
});

var User = mongoose.model('User');

var regexp = /^https:\/\/si0.twimg.com\//;

User.find({
  picture: regexp
}, function(err, users){

  for(var i=0; i<users.length; i++){
    console.log(users[i].username + " - " + users[i].picture);
    var final = users[i].picture.replace(regexp, "https://pbs.twimg.com/");
    console.log("> " + final);
    users[i].picture = final;   
  }

  var i=0;
  function next(){
    users[i].save(function(err, usr){
      if (err) return console.log(err);
      i++;
      if (i<users.length){
        next();
      }
      else {
        console.log("Users found and replaced: " + i);
        process.kill();
      }
    });
  }

  if (users.length > 0){
    next();
  }
  else {
    console.log("No Users found");
    process.kill();
  }
});

