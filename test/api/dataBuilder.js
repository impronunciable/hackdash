
var mongoose = require('mongoose');
var async = require('async');
var loaded = false;

module.exports = function(config){

  if (!loaded){
    mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));
    require('../../models')(config);
    loaded = true;
  }

  return {
    create: create,
    clear: clear,
    clearAll: function(doneAll){
      async.series([
        function(done){ clear('Dashboard', done); },
        function(done){ clear('Project', done); },
        function(done){ clear('User', done); }
      ], doneAll);
    },
    dropDatabase: function(done){
      mongoose.connection.db.executeDbCommand({dropDatabase:1}, done);
    }
  };

};

function clear(type, done){
  mongoose.model(type).collection.remove(done);
}

function create(type, toCreate, done){
  toCreate = Array.isArray(toCreate) ? toCreate : [ toCreate ];

  mongoose.model(type).create(toCreate, function (err) {
    done(err, [].slice.call(arguments, 1));
  });
}
