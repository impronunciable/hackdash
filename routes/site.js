
var passport = require('passport')
  , config = require('../config.json')
  , mongoose = require('mongoose');

var Dashboard = mongoose.model('Dashboard');

module.exports = function(app) {
  var metas = require('../utils/metas')(app);

  function renderHDStack(req, res){
    var dash = metas.getDashboardName(req);
    if (dash){
      res.render('hackdashApp');
    }
    else {
      res.render('landing');
    }
  };

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
    metas.check(),
    //render('hackdashApp')
    renderHDStack
  ];

  //TODO: hack to remove "checkProfile" and avoid redirect loop
  // when user has no email set
  var hackdashProfileStack = hackdashFullStack.slice(0);
  hackdashProfileStack.splice(3, 1);

  // home page if no subdomain
  // dashboard if subdomain
  app.get('/', metas.dashboard, hackdashFullStack);

  // Search all projects if no subdomain
  // Search projects inside dashboard if subdomain
  // ?q=[query]
  app.get('/projects', metas.projects, hackdashFullStack);

  // Project Create Form for a dashboard - ONLY with a subdomain
  app.get('/projects/create', hackdashFullStack);

  // Project View - Always Read Only
  app.get('/projects/:pid', metas.project, hackdashFullStack);

  // Project Edit Form - ONLY with a domain - redirects if not
  app.get('/projects/:pid/edit', hackdashFullStack);

  // Dashboards search - ONLY without subdomain - redirects if any
  // ?q=[query]
  app.get('/dashboards', metas.dashboards, hackdashFullStack);

  // Dashboards by domain
  app.get('/dashboards/:dashboard', metas.dashboard, hackdashFullStack);

  // Collections search - ONLY without subdomain - redirects if any
  // ?q=[query]
  app.get('/collections', metas.collections, hackdashFullStack);

  // Collection View - ONLY without subdomain - redirects if any
  // Shows a list of dashboards - NO SEARCH
  app.get('/collections/:cid', metas.collection, hackdashFullStack);

  // User Profile's View
  app.get('/users/profile', hackdashProfileStack);

  // Users Profile's card and entities
  app.get('/users/:user_id', metas.user, hackdashFullStack);

  // Live view of a Dashboard - ONLY with a subomain
  app.get('/live', metas.dashboard, liveStack);

  // Login view
  app.get('/login', hackdashFullStack);

  // Logout
  app.get('/logout', logout, redirect('/'));

  //keep previous Projects link working
  app.get('/p/:pid', function(req, res){
    res.redirect(301, '/projects/' + req.params.pid);
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
