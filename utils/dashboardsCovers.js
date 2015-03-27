
/*
 * Migration Script for version v0.8.0 (April 2015)
 * Script to update all Dashboards stats:
 * contained project covers and current project count.
 */

var
    config = require('../config.json')
  , async = require('async')
  , mongoose = require('mongoose');

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('../models')({
  get: function(){
    return ['brainstorming','wireframing','building','researching','prototyping','releasing'];
  }
});

var Dashboard = mongoose.model('Dashboard');
var Project = mongoose.model('Project');

console.log('Updating dashboards ... ');

Dashboard
  .find()
  .exec(function(err, dashboards) {
    if(err) throw err;

    var calls = [];

    dashboards.forEach(function(dashboard){

      calls.push((function(_dashboard){

        return function(_done){

          Project
            .find({ domain: _dashboard.domain })
            .exec(function(err, projects){

              _dashboard.projectsCount = projects.length;
              _dashboard.covers = [];
              projects.forEach(function(project){
                if (project.cover){
                  _dashboard.covers.push(project.cover);
                }
              });

              _dashboard.save(function(){
                _done(null, _dashboard.covers.length);
              });

            });
        };

      })(dashboard));

    });

    async.series(calls, function(err, results){
      console.log('Updated %s dashboards', results.length);
      process.exit(0);
    });

  });
