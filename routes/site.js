
var passport = require('passport')
  , config = require('../config.json')
  , mongoose = require('mongoose')
  , _ = require('underscore');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

module.exports = function(app) {

  /*
   * Dashboard middleware stack
   */

  var dashboardStack = [
    loadUser, 
    loadProviders,
    loadDashboard,
    loadApplicants,
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    render('dashboard')
  ];

  var liveStack = [
    isLive(app),
    loadUser, 
    loadProviders,
    loadDashboard,
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    setViewVar('live', true),
    render('live')
	];

  app.get('/2013/apps/', checkProfile, dashboardStack);
  app.get('/2013/apps/live', liveStack);
  app.get('/2013/apps/login', dashboardStack);
  app.get('/2013/apps/projects/create', dashboardStack);
  app.get('/2013/apps/projects/edit/:project_id', dashboardStack);
  app.get('/2013/apps/p/:project_id', dashboardStack);
  app.get('/2013/apps/search', dashboardStack);
  app.get('/2013/apps/logout', logout, redirect('/'));  
  app.get('/2013/apps/about', loadUser, render('about'));
  app.get('/2013/apps/users/applicants', dashboardStack);
  app.get('/2013/apps/users/profile', dashboardStack);
  app.get('/2013/apps/users/:user_id', dashboardStack);
};

/*
 * Render templates
 */
var render = function(path) {
  return function(req, res) {
    res.render(path);
  };
};

/*
 * Redirect to a route
 */

var redirect = function(route) {
  return function(req, res) {
    res.redirect(route);
  };
};

var checkProfile = function(req, res, next){
  if (req.user && !req.user.email){
    res.redirect('/2013/apps/users/profile');
  }

  next();
};

var isLive = function(app) {
	return function(req, res, next) {
		if(app.get('config').live) {
			next();
		} else {
			res.send(404);
		}
	}
};

/*
 * Add current user template variable
 */

var loadUser = function(req, res, next) {
  res.locals.errors = [];
  res.locals.user = req.user;
  next();
};

/*
 * Add applicants template variable
 */

var loadApplicants = function(req, res, next) {
  if(typeof req.user !== 'undefined'){
    Project.find({leader:req.user._id}, 'applicants')
    .populate('applicants')
    .exec(function(err, projects) {
      if(err || !projects) return res.send(500);
      var applicants = _.reduceRight(_.pluck(projects,'applicants'), function(a, b) { return a.concat(b); }, []);      
      res.locals.applicants = applicants;      
      next();
    });
  }else{
    next();
  }
};

/*
 * Check if current user is authenticated
 */

var isAuth = function(req, res, next){
  (req.isAuthenticated()) ? next() : res.send(403);
};

/*
 * Makes vars available to views
 */

var setViewVar = function(key, value) {
  return function(req, res, next) {
    res.locals[key] = value;
    next();
  };
};  

/*
 * Load app providers
 */

var loadProviders = function(req, res, next) {
  res.locals.providers = req.app.get('providers');
  next();
};

/*
 * Load specific project
 */

var loadProject = function(req, res, next) {
  Project.findById(req.params.project_id)
  .populate('contributors')
  .populate('pending')
  .populate('leader')
  .exec(function(err, project) {
    if(err || !project) return res.send(500);
    res.locals.project = project;
    res.locals.user = req.user;
    next();
  });
};

/*
 * Load dashboard
 */

var loadDashboard = function(req, res, next) {
  Dashboard.findOne({}, function(err, dash) {
    if (err) return res.send(404);
    else if(!dash) {
      var dash = new Dashboard({});
      dash.save(function(err, doc){
        res.locals.dashboard = dash;
        next();
      });
    }
    else {
      res.locals.dashboard = dash;
      next();
    } 
  });
};

/*
 * Log out current user
 */

var logout = function(req, res, next) {
  req.logout();
  next();
};
