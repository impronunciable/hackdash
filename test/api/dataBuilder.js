
var mongoose = require('mongoose');
var async = require('async');
var loaded = false;

module.exports = function(config){

  if (!loaded && config){
    mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));
    require('../../models')(config);
    loaded = true;
  }

  return {
    create: create,
    count: count,
    clear: clear,
    getById: function(type, id, done){
      mongoose.model(type).findById(id, done);
    },
    getFakeId: function(){
      return mongoose.Types.ObjectId();
    },
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

/*
 * clear(type)
 * clear(type, done)
 * clear(type, [ _id1, _id2 ], done)
 */
function clear(){
   var type = arguments[0],
    ids = {},
    done = arguments[1] || function(){};

  if (arguments.length > 2){
    ids = {
      _id: { $in: arguments[1] }
    };

    done = arguments[2];
  }

  mongoose.model(type).remove(ids, done);
}

function create(type, toCreate, done){
  toCreate = Array.isArray(toCreate) ? toCreate : [ toCreate ];

  mongoose.model(type).create(toCreate, function (err) {
    done(err, [].slice.call(arguments, 1));
  });
}

/*
 * count(type, done)
 * count(type, { mongo_query }, done)
 */

function count(){
  var type = arguments[0],
    query = {},
    done = arguments[1];

  if (arguments.length > 2){
    query = done;
    done = arguments[2];
  }

  mongoose.model(type).count(query || {}, done);
}