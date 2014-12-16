
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  sm = require('sitemap'),
  fs = require('fs'),
  url = require('url'),
  async = require('async'),
  _ = require('underscore'),
  executing = false;

var config = require('../config.json');
var configSM = require('./config.json');

mongoose.connect(config.db.url || 
  ('mongodb://' + config.db.host + '/'+ config.db.name));

mongoose.model('Project', new Schema(require('../models/Project')) );
mongoose.model('Dashboard', new Schema(require('../models/Dashboard')) );
mongoose.model('Collection', new Schema(require('../models/Collection')) );

function createSiteMap(urls, done) {

  var sitemap = sm.createSitemap({
    hostname: url.format({ 
      protocol: 'http', hostname: config.host, port: config.port }),
    cacheTime: 600000,  // 10 min
    urls: urls
  });

  fs.writeFile("../public/sitemap.xml", sitemap.toString(), function(err) {
    
    if(err) {
      console.log("Sitemap NOT updated");
      console.log(err);
      //process.exit(1);
      return done();
    }

    console.log("Sitemap updated - %s Resources", urls.length);
    //process.exit(0);
    done();
  }); 
}

var exec = {
  projects: function(done){
    var Project = mongoose.model('Project');
    Project.find({}, function(err, projects){

      done(null, _.map(projects || [], function(p){
        var cfg = _.clone(configSM.projects);
        cfg.url = cfg.url.replace(/:id/ig, p._id);
        return cfg;
      }));

    });
  },
  dashboards: function(done){
    var Dashboard = mongoose.model('Dashboard');

    Dashboard.find({}, function(err, dashboards){

      done(null, _.map(dashboards || [], function(d){
        var cfg = _.clone(configSM.dashboards);
        cfg.url = cfg.url.replace(/:id/ig, d.domain);
        return cfg;
      }));

    });
  },
  collections: function(done){
    var Collection = mongoose.model('Collection');

    Collection.find({}, function(err, collections){

      done(null, _.map(collections || [], function(c){
        var cfg = _.clone(configSM.collections);
        cfg.url = cfg.url.replace(/:id/ig, c._id);
        return cfg;
      }));

    });
  }
};

module.exports = function(){
  if (executing) return;

  executing = true;
  console.log('>>>>>  Runing  <<<<< %s', new Date());

  async.parallel(exec, function(err, urls){

    console.log("Writing Sitemap");
    console.log(" %s Projects", urls.projects.length);
    console.log(" %s Dashboards", urls.dashboards.length);
    console.log(" %s Collections", urls.collections.length);

    var urls = 
      urls.projects.concat(urls.dashboards.concat(urls.collections));

    createSiteMap(urls, function(){
      console.log('>>>>> Finished <<<<< %s', new Date());
      executing = false;
    });

  });

};
