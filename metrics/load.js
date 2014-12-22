
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  async = require('async'),
  jf = require('jsonfile'),
  executing = false;

var config = require('../config.json');
var configM = require('./config.json');

jf.spaces = 2;

mongoose.connect(config.db.url || 
  ('mongodb://' + config.db.host + '/'+ config.db.name));

mongoose.model('User', new Schema(require('../models/User')) );
mongoose.model('Project', new Schema(require('../models/Project')) );
mongoose.model('Dashboard', new Schema(require('../models/Dashboard')) );
mongoose.model('Collection', new Schema(require('../models/Collection')) );

var hasCreated = { created_at: { $exists: true } };
var aggregation = [
  { $match: hasCreated },
  { 
    $group: {
      _id: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" },
        //day: { $dayOfMonth: "$created_at" }
      },
      count: { $sum: 1 }
    }
  }, 

  { $project: { date: "$_id", count: 1, _id: 0 } },
  { $sort: { "date": 1 } }
];

var exec = {

  users: function(done){
    var User = mongoose.model('User');

    User.aggregate(aggregation, function(err, users){
      if (err) { return done(err); }

      User.count(hasCreated, function(err, count){
        done(err, {
          total: count,
          data: users
        });
      });

    });
  },
  projects: function(done){
    var Project = mongoose.model('Project');

    Project.aggregate(aggregation, function(err, projects){
      if (err) { return done(err); }

      Project.count(hasCreated, function(err, count){
        done(err, {
          total: count,
          data: projects
        });
      });

    });
  },
  dashboards: function(done){
    var Dashboard = mongoose.model('Dashboard');
    
    Dashboard.aggregate(aggregation, function(err, dashboards){
      if (err) { return done(err); }

      Dashboard.count(hasCreated, function(err, count){
        done(err, {
          total: count,
          data: dashboards
        });
      });

    });
  },
  collections: function(done){
    var Collection = mongoose.model('Collection');

    Collection.aggregate(aggregation, function(err, collections){
      if (err) { return done(err); }

      Collection.count(hasCreated, function(err, count){
        done(err, {
          total: count,
          data: collections
        });
      });

    });
  }
};

module.exports = function(done){
  if (executing) return;

  executing = true;
  console.log('>>>>>  Runing %s', new Date());

  async.parallel(exec, function(err, data){
    if (err){ 
      return console.log(err); 
      console.log('Metrics NOT updated!');
    }

/*
    console.log(" %s Users", data.users.total);
    console.log(" %s Projects", data.projects.total);
    console.log(" %s Dashboards", data.dashboards.total);
    console.log(" %s Collections", data.collections.total);

    console.dir(data.users.data);
    console.dir(data.projects.data);
    console.dir(data.dashboards.data);
    console.dir(data.collections.data);
*/
    
    jf.writeFile('./' + configM.filename, data, function(err) {
      
      if(err) {
        console.log("Metrics NOT updated!");
        console.log(err);
        return done();
      }

      console.log('>>>>> Finished %s', new Date());
      executing = false;

      done && done();
    }); 

  });

};
