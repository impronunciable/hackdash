
var mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard')
  , Collection = mongoose.model('Collection');

function checkEntityResponse(res, err, entity){
  if (err) {
    console.log(err);
    res.status(500);
    res.render('500');
    return true;
  }

  if (!entity) {
    res.status(404);
    res.render('404');
    return true;
  }
}

module.exports = function(app){

  var config = app.get('config');
  var hdTitle = config.title || "HackDash";
  var hdDomain = config.host;
  var baseURL = 'http://' + hdDomain;

  return {

    projects: function(req, res, next){
      res.locals.meta = {
        url: baseURL + '/projects/',
        title: "Projects",
        description: "Search projects at " + hdTitle
      };

      next();
    },

    project: function(req, res, next){
      var domain = getDashboardName(req);

      Project.findById(req.params.pid, function(err, project) {
        if (checkEntityResponse(res, err, project)) return;

        res.locals.meta = {
          url: baseURL + '/projects/' + project._id,
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
        url: baseURL,
        title: "Dashboards",
        description: "Search dashboards at " + hdTitle
      };

      next();
    },

    dashboard: function(req, res, next){
      var domain = getDashboardName(req);

      if (!domain) {
        // Home Page

        res.locals.meta = {
          url: baseURL,
          title: "HackDash: Ideas for a hackathon",
          description: "Ideas for a hackathon. Upload your project. Add colaborators. Inform status. Share your app."
        };

        return next();
      }

      Dashboard.findOne({ domain: domain }, function(err, dashboard) {
        if (checkEntityResponse(res, err, dashboard)) return;

        res.locals.meta = {
          url: 'http://' + domain + '.' + hdDomain,
          title: dashboard.title,
          description: dashboard.description
        };

        if (!dashboard.description){
          Project.findOne({ domain: domain }, function(err, project) {
            if (project && project.description){
              res.locals.meta.description = project.description;
            }
            next();
          });
        }
        else {
          next();
        }

      });
    },

    collections: function(req, res, next){
      res.locals.meta = {
        url: baseURL + '/collections/',
        title: "Collections",
        description: "Search collections at " + hdTitle
      };

      next();
    },

    collection: function(req, res, next){
      Collection.findById(req.params.cid, function(err, collection) {
        if (checkEntityResponse(res, err, collection)) return;

        res.locals.meta = {
          url: baseURL + '/collections/' + collection._id,
          title: collection.title,
          description: collection.description
        };

        next();
      });
    },

    users: function(req, res, next){
      res.locals.meta = {
        url: baseURL + '/users/',
        title: "People",
        description: "Search people at " + hdTitle
      };

      next();
    },

    user: function(req, res, next){
      User.findById(req.params.user_id, function(err, user){
        if (checkEntityResponse(res, err, user)) return;

        res.locals.meta = {
          url: baseURL + '/users/' + user._id,
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

        if (!metas.url){
          metas.url = baseURL;
        }

        metas.title += hdTitle;
        metas.image =  baseURL + metas.image;

        next();
      };
    },
    getDashboardName: getDashboardName
  };
};

function getDashboardName(req){

  if (req.subdomains.length > 0) {
    return req.subdomains[0];
  }
  else if (req.params.dashboard) {
    return req.params.dashboard;
  }

  return null;
}
