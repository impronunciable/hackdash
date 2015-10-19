require('babel/register');

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , moment = require('moment')
  , fs = require('fs')
  , async = require('async');

var config = require('../config');

mongoose.connect(config.db.url ||
  ('mongodb://' + config.db.host + '/'+ config.db.name));

mongoose.model('User', new Schema(require('../lib/models/user')) );
mongoose.model('Project', new Schema(require('../lib/models/project')) );
mongoose.model('Dashboard', new Schema(require('../lib/models/dashboard')) );

var batchSize = 10000;
var sort = 'created_at';
var year = 2015;
var whenStart = new Date(year, 0, 1);

var exec = [

  // get all dashboards from the Date
  function(done){
    var Dashboard = mongoose.model('Dashboard');

    Dashboard.find({ created_at: { $gt: whenStart } })
      .batchSize(batchSize).sort(sort)
      .exec(function(err, dashboards){
        if (err) return done(err);
        console.log('%s dashboards processed', dashboards.length);
        done(null, dashboards);
      });
  },

  // get all admins for dashboards from the Date
  function(dashboards, done){
    var User = mongoose.model('User');

    var domains = dashboards.map(function(dash){
      return dash.domain;
    });

    User.find({ admin_in: { $in: domains } })
      .batchSize(batchSize).sort(sort)
      .exec(function(err, users){
        if (err) return done(err);
        console.log('%s admins processed', users.length);
        done(null, users);
      });
  },

  // get all projects for the date, parse all users in them and add admins
  function(admins, done){
    var Project = mongoose.model('Project');

    Project.find({ created_at: { $gt: whenStart } })
      .batchSize(batchSize).sort(sort)
      .populate('leader')
      .populate('contributors')
      .populate('followers')
      .exec(function(err, projects){
        if (err) return done(err);
        console.log('%s projects processed', projects.length);

        var uniques = [];
        var users = [];

        function addUser(user){
          if (uniques.indexOf(user._id.toString()) === -1){
            uniques.push(user._id.toString());
            users.push(user);
          }
        }

        projects.forEach(function(p){
          addUser(p.leader);
          p.contributors.forEach(addUser);
          p.followers.forEach(addUser);
        });

        console.log('%s projects unique users processed', users.length);
        admins.forEach(addUser);

        console.log('%s total unique users processed', users.length);
        done(null, users);
      });
  },

  // create CSV export file
  function(users, done){

    var wstream = fs.createWriteStream(__dirname + '/active_users_'+year+'.csv');

    function CSVEscape(field) {
      return String(field || "").replace(/\"/g, '').replace(/,/g, '').replace(/\n/g, ' ');
    }

    var headers = [
        'name'
      , 'email'
      , 'bio'
      , 'profile'
      , 'created'
    ].map(CSVEscape).join(',');

    wstream.write(headers + '\n');

    users.forEach(function(user){
      wstream.write([
        user.name,
        user.email,
        user.bio,
        'https://hackdash.org/users/' + user._id,
        moment(user.created_at).format('DD/MM/YYYY')
      ].map(CSVEscape).join(',') + '\n');
    });

    wstream.end(done);
  }

];

async.waterfall(exec, function(err){
  if (err) console.log(err);
  process.exit(0);
});
