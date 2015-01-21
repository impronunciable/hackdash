
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  fs = require('fs'),
  moment = require('moment');

var config = require('../config.json');

mongoose.connect(config.db.url ||
  ('mongodb://' + config.db.host + '/'+ config.db.name));

mongoose.model('Project', new Schema(require('../models/Project')) );
mongoose.model('Dashboard', new Schema(require('../models/Dashboard')) );

var Dashboard = mongoose.model('Dashboard');
var Project = mongoose.model('Project');

var wstream = fs.createWriteStream(__dirname + '/dashboards.csv');

function CSVEscape(field) {
  return String(field || "").replace(/\"/g, '""').replace(/,/g, '');
}

var headers = [
    'name'
  , 'title'
  , 'created'
  , 'projects'
  , 'contributors'
  , 'followers'
  , 'open'
  , 'link'
].map(CSVEscape).join(',');

wstream.write(headers + '\n');

var count = 0;
var wrotes = 0;

Dashboard.count({}, function(err, _count){
  console.log('Reading %s Dashboards', _count);
  count = _count;

  Dashboard.find({})
    .sort( { "created_at" : -1 } )
    .stream()
    .on('data', function (dashboard) {
      getDashboardCSV(dashboard, function(err, data){
        wstream.write(data);
        wrotes++;
        wrote(dashboard);
      });
    })
    .on('close', function () {
      console.log('finished readings ...');
    })
    .on('error', function (err) {
      wstream.end();
      throw err;
    });
});

function wrapup(){
  console.log('All done! - Wrote %s Dashboards', wrotes);
  process.exit(0);
}

function wrote(dashboard){
  count--;
  if (count <= 0){
    wstream.on('finish', wrapup); //node >= 0.10
    wstream.end(wrapup); //node < 0.10
  }
}

var getDashboardCSV = function(dashboard, done){

  var dash = {
    name: dashboard.domain,
    title: dashboard.title,
    created: dashboard.created_at,
    projects: 0,
    contributors: 0,
    followers: 0,
    open: dashboard.open,
    link: 'http://' + dashboard.domain + '.hackdash.org'
  };

  Project
    .find({ domain: dashboard.domain })
    .exec(function(err, projects){
      if (err) return done(err);
      projects = projects || [];

      dash.projects = projects.length;

      if (projects.length > 0){

        var contributors = [], followers = [];
        projects.forEach(function(p){

          p.contributors.forEach(function(c){
            if (contributors.indexOf(c) === -1) contributors.push(c);
          });

          p.followers.forEach(function(f){
            if (followers.indexOf(f) === -1) followers.push(f);
          });

        });

        dash.contributors = contributors.length;
        dash.followers = followers.length;
      }

      done(null, [
        dash.name,
        dash.title,
        moment(dash.created).format('DD/MM/YYYY'),
        dash.projects.toString(),
        dash.contributors.toString(),
        dash.followers.toString(),
        dash.open.toString(),
        dash.link
      ].map(CSVEscape).join(',') + '\n');

    });

};
