
var passport = require('passport')
  , mongoose = require('mongoose');

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
    setViewVar('statuses', app.get('statuses')),
    render('dashboard')
  ];

  app.get('/admin', isAuth, isAdmin, loadDashboard, render('admin'));
  app.post('/admin', isAuth, isAdmin, saveDashboard, render('admin'));
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
 * Check if current user is authenticated
 */

var isAuth = function(req, res, next){
  (req.isAuthenticated()) ? next() : res.send(403);
};


/*
 * Add current user template variable
 */

var loadUser = function(req, res, next) {
  res.locals.user = req.user;
  next();
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

/**
 * User is dashboard admin
 */

var isAdmin = function(req, res, next) {
  var domain = req.subdomains[0];
	if(req.user.admin_in.indexOf(domain) != -1) next();
	else res.send(401);
};

/*
 * Load dashboard data in res.locals.dashboard
 */ 

var loadDashboard = function(req, res, next) {
  Dashboard.findOne({domain: req.subdomains[0]}, function(err, dash){
    if(err) next(err);
    else if(!dash) res.send(401);
    else {
      res.locals.dashboard = dash;
      next();
    }
  });
};

/*
 * Save the dashboard settings
 */

var saveDashboard = function(req, res, next) {
  var opts = req.body;
  Dashboard.findOne({domain: req.subdomains[0]}, function(err, dash){
    if(err) next(err);
    else if(!dash) res.send(401);
    else {
      dash.title = opts.title || dash.title;
      dash.description = opts.description || dash.description;
      dash.background = opts.background || dash.background;
      dash.save(function(err, doc){
        res.locals.dashboard = doc;
        next();
      });
    }
  });
};
