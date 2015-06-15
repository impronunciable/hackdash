
/*
 * Migration Script for version v0.9.4 (Jun 2015)
 * Script to remove protocol HTTP from Users Pictures:
 * Turn to procol-less pattern.
 */

var
    config = require('../../config.json')
  , async = require('async')
  , mongoose = require('mongoose');

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('../../models')({
  get: function(){
    return ['brainstorming','wireframing','building','researching','prototyping','releasing'];
  }
});

var Dashboard = mongoose.model('Dashboard');
var User = mongoose.model('User');

console.log('Updating user pictures ... ');

User
  .find({ picture: /^http:\/\// })
  .exec(function(err, users) {
    if(err) throw err;

    var calls = [];
    var count = 0;

    users.forEach(function(user){

      calls.push((function(_user){

        return function(_done){

          _user.picture = _user.picture.replace(/^http:\/\//, '//');

          _user.save(function(err){
            if (!err) count++;
            _done(err);
          });

        };

      })(user));

    });

    async.series(calls, function(err){
      if (err){
        console.log('Error Ocurred > ');
        console.log(err);
      }

      console.log('Updated %s Users', count);
      process.exit(0);
    });

  });
