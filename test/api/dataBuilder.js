
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
    createProject: createProject,
    createDashboard: createDashboard,
    clear: function(type, done){
      mongoose.model(type).collection.remove(done);
    },
  };

};

function create(type, toCreate, done){
  toCreate = Array.isArray(toCreate) ? toCreate : [ toCreate ];

  mongoose.model(type).create(toCreate, function (err) {
    done(err, [].slice.call(arguments));
  });
}

function createProject(toCreate, done){

  async.parallel({
    leader: function(cb){
      if (toCreate.leader && toCreate.leader.length > 0){
        create('Users', toCreate.leader, cb);
      }
    },
    collaborators: function(cb){
      if (toCreate.collaborators && toCreate.collaborators.length > 0){
        create('Users', toCreate.collaborators, cb);
      }
    },
    followers: function(cb){
      if (toCreate.followers && toCreate.followers.length > 0){
        create('Users', toCreate.followers, cb);
      }
    },
  }, function(err, data){

    toCreate.leader = data.leader;
    toCreate.collaborators = data.collaborators;
    toCreate.followers = data.followers;
    
    create('Project', toCreate, done);
  });
}

function createDashboard(toCreate, done){

  async.parallel({
    admins: function(done){
      if (toCreate.admins && toCreate.admins.length > 0){
        create('Users', toCreate.admins, done);
      }
    },
    projects: function(done){
      var projectsFN = [];

      toCreate.forEach(function(project){

        projectsFN.push((function(p){
          return function(_done){ createProject(p, _done); };
        })(project));

      });

      async.series(projectsFN, done);
    }
  }, function(err, data){

    toCreate.admins = data.admins;
    toCreate.projects = data.projects;
    
    create('Project', toCreate, done);
  });
}
