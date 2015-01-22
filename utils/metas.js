
var mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard')
  , Collection = mongoose.model('Collection');

module.exports = function(app){

  var config = app.get('config');
  var hdTitle = config.title || "HackDash";

  return {

    projects: function(req, res, next){
      res.locals.meta = {
        title: "Find Projects",
        description: "Search projects at " + hdTitle
      };

      next();
    },

    project: function(req, res, next){
      var domain = getDashboardName(req);

      Project.findById(req.params.pid, function(err, project) {
        if (err || !project) return next();
        // TODO: NotFound

        res.locals.meta = {
          title: project.title,
          description: project.description,
          image: project.cover
        };

        Dashboard.findOne({ domain: domain }, function(err, dashboard) {

          if(!err && dashboard && dashboard.title){
            res.locals.meta.title += " - " + dashboard.title;
          }

          next();
        });
      });
    },

    dashboards: function(req, res, next){
      res.locals.meta = {
        title: "Create collections",
        description: "Create your collection at " + hdTitle
      };

      next();
    },

    dashboard: function(req, res, next){
      var domain = getDashboardName(req);

      if (!domain) {
        // Home Page

        res.locals.meta = {
          title: "HackDash: Ideas for a hackathon",
          description: "Ideas for a hackathon. Upload your project. Add colaborators. Inform status. Share your app."
        };

        return next();
      }

      Dashboard.findOne({ domain: domain }, function(err, dashboard) {
        if(err || !dashboard) return next();
        // TODO: NotFound
        res.locals.meta = {
          title: dashboard.title,
          description: dashboard.description
        };

        next();
      });
    },

    collections: function(req, res, next){
      res.locals.meta = {
        title: "Collections",
        description: "Search collections at " + hdTitle
      };

      next();
    },

    collection: function(req, res, next){
      Collection.findById(req.params.cid, function(err, collection) {
        if (err || !collection) return next();
        // TODO: NotFound

        res.locals.meta = {
          title: collection.title,
          description: collection.description
        };

        next();
      });
    },

    user: function(req, res, next){
      User.findById(req.params.user_id, function(err, user){
        if(err || !user) return next();
        // TODO: NotFound

        res.locals.meta = {
          title: user.name,
          description: user.bio
        };

        next();
      });
    },

    check: function(){
      return function(req, res, next) {

        if (!res.locals.meta){
          res.locals.meta = {};
        }

        var metas = res.locals.meta;

        if (metas.title){
          metas.title += " - ";
        }
        else {
          metas.title = "";
        }

        if (!metas.image){
          metas.image = "/images/logohack.png";
        }

        metas.title += hdTitle;
        metas.image =  "http://" + app.get('config').host + metas.image;

        next();
      };
    }

  };
};

var getDashboardName = function(req){
  if (req.subdomains.length > 0) {
    return req.subdomains[0];
  }
  else if (req.params.dashboard) {
    return req.params.dashboard;
  }

  return null;
}
