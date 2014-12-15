
var mongoose = require('mongoose'),
  sm = require('sitemap'),
  fs = require('fs'),
  url = require('url'),
  async = require('async'),
  _ = require('underscore');

var config = require('../config.json');
mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('./models')({
  get: function(){ return ['brainstorming','wireframing','building','researching','prototyping','releasing']; }
});

function createSiteMap(urls) {

  var sitemap = sm.createSitemap({
    hostname: url.format({ 
      protocol: 'http', hostname: config.host, port: config.port }),
    cacheTime: 600000,  // 10 min
    urls: urls
  });

  fs.writeFile("../public/sitemap.xml", sitemap.toString(), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("Sitemap ready!");
  }); 
}

async.parallel({
  projects: function(done){
    var Project = mongoose.model('Project');
    Project.find({}, function(err, projects){

      done(null, _.map(projects || [], function(p){
        return { 
          url: '/projects/' + p._id, 
          changefreq: 'daily', 
          priority: 0.3 
        };
      }));

    });
  },
  dashboards: function(done){
    var Dashboard = mongoose.model('Dashboard');

    Dashboard.find({}, function(err, dashboards){

      done(null, _.map(dashboards || [], function(dash){
        return { 
          url: '/dashboards/' + dash.domain, 
          changefreq: 'daily', 
          priority: 0.5 
        };
      }));

    });
  },
  collections: function(done){
    var Collection = mongoose.model('Collection');

    Collection.find({}, function(err, collections){

      done(null, _.map(collections || [], function(coll){
        return { 
          url: '/collections/' + coll._id, 
          changefreq: 'daily', 
          priority: 0.6 
        };
      }));

    });
  }
}, function(err, urls){

  createSiteMap(
    urls.projects.concat(
      urls.dashboards.concat(
        urls.collections
      )
    )
  );
});


