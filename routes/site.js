
var passport = require('passport')
  , config = require('../config.json')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

module.exports = function(app) {

  var liveStack = [
    isLive(app),
    loadUser, 
    loadProviders,
    dashExists,
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    setViewVar('live', true),
    render('live')
  ];

  var appPort = app.get('config').port;
  var appHost = app.get('config').host + (appPort && appPort !== 80 ? ':' + appPort : '');

  var hackdashFullStack = [
    loadUser, 
    loadProviders,
    setSubdomain,
    checkProfile,
    setViewVar('host', appHost),
    setViewVar('version', app.get('clientVersion')),
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    render('hackdashApp')
  ];

  // home page if no subdomain
  // dashboard if subdomain
  app.get('/', hackdashFullStack);

  // Search all projects if no subdomain
  // Search projects inside dashboard if subdomain
  // ?q=[query]
  app.get('/projects', hackdashFullStack);

  // Project Create Form for a dashboard - ONLY with a subdomain
  app.get('/projects/create', hackdashFullStack);

  // Project View - Always Read Only
  app.get('/projects/:pid', hackdashFullStack);

  // Project Edit Form - ONLY with a domain - redirects if not
  app.get('/projects/:pid/edit', hackdashFullStack);

  // Dashboards search - ONLY without subdomain - redirects if any
  // ?q=[query]
  app.get('/dashboards', hackdashFullStack);

  // Collections search - ONLY without subdomain - redirects if any
  // ?q=[query]
  app.get('/collections', hackdashFullStack);

  // Collection View - ONLY without subdomain - redirects if any
  // Shows a list of dashboards - NO SEARCH
  app.get('/collections/:cid', hackdashFullStack);

  // User Profile's View
  app.get('/users/profile', hackdashFullStack);

  // Users Profile's card and entities
  app.get('/users/:user_id', hackdashFullStack);

  // Live view of a Dashboard - ONLY with a subomain
  app.get('/live', liveStack);

  // Login view
  app.get('/login', hackdashFullStack);
  
  // Logout
  app.get('/logout', logout, redirect('/'));

  //keep previous Projects link working
  app.get('/p/:pid', function(req, res){ 
    res.redirect('/projects/' + req.params.pid);
  });

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

var setSubdomain = function(req, res, next){
  res.locals.subdomain = null;

  if (req.subdomains.length){
    res.locals.subdomain = req.subdomains[0]; 
  }

  next();
};

var checkProfile = function(req, res, next){
  if (req.user && !req.user.email){
    res.redirect('/users/profile');
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
 * Log out current user
 */

var logout = function(req, res, next) {
  req.logout();
  next();
};

var dashExists = function(req, res, next) {
  Dashboard.findOne({ domain: req.subdomains[0] }, function(err, dash) {
    if (err || !dash) return res.send(404);
    res.locals.dashboard = dash;
    next();
  });
};
