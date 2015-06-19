
var passport = require('passport')
  , config = require('../config.json')
  , keys = require('../keys.json')
  , mongoose = require('mongoose');

var Dashboard = mongoose.model('Dashboard');

var appPort;
var appHost;

module.exports = function(app) {
  var metas = require('../utils/metas')(app);

  appPort = app.get('config').port;
  appHost = app.get('config').host + (appPort && appPort !== 80 ? ':' + appPort : '');

/*
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
*/

  var userStack = [ loadUser, loadProviders ];

  var viewsStack = [
    setViewVar('host', appHost),
    setViewVar('version', app.get('clientVersion')),
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    setViewVar('googleAnalytics', config.googleAnalytics || null),
    setViewVar('fbAppId', (keys.facebook && keys.facebook.clientID) || config.facebookAppId || null),

    metas.check()
  ];

  var homeStack = []
    .concat([hasSubDomain_GoDashboard])
    .concat(userStack)
    .concat([checkProfile])
    .concat(viewsStack)
    .concat([render('landing')]);

  var appStack = []
    .concat([hasSubDomain_RemoveIt])
    .concat(userStack)
    .concat([checkProfile])
    .concat(viewsStack)
    .concat([render('app')]);

  var profileStack = []
    .concat([hasSubDomain_RemoveIt])
    .concat(userStack)
    .concat(viewsStack)
    .concat([render('app')]);

  var embedStack = []
    .concat([hasSubDomain_RemoveIt])
    .concat(viewsStack)
    .concat([render('embed')]);

  // Landing ----------------------------
  app.get('/', metas.dashboard, homeStack);

  app.get('/collections', metas.collections, homeStack);
  app.get('/dashboards', metas.dashboards, homeStack);
  app.get('/projects', metas.projects, homeStack);
  app.get('/users', metas.users, homeStack);

  // APP --------------------------------
  app.get('/collections/:cid', metas.collection, appStack);
  app.get('/dashboards/:dashboard', metas.dashboard, appStack);
  app.get('/dashboards/:dashboard/create', metas.dashboard, appStack);

  app.get('/users/profile', profileStack);
  app.get('/users/:user_id', metas.user, appStack);

  // Auth  ------------------------------
  app.get('/login', homeStack);
  app.get('/logout', logout, redirect('/'));

  // Live view of a Dashboard - ONLY with a subomain
  //app.get('/live', metas.dashboard, liveStack);


  // Projects --------------------------

  // if subdomain, redirect new creation url /dashboards/:dash/create
  // else go home landing
  app.get('/projects/create', function(req, res){
    var protocol = req.socket.encrypted ? 'https' : 'http';

    if (req.subdomains.length > 0) {
      var baseUrl = protocol + '://' + appHost + '/dashboards/' + req.subdomains[0];
      return res.redirect(baseUrl + '/create');
    }

    return res.redirect(protocol + '://' + appHost + '/');
  });

  app.get('/projects/:pid', metas.project, appStack);
  app.get('/projects/:pid/edit', appStack);

  // keep old projects url
  app.get('/p/:pid', function(req, res){
    res.redirect(301, '/projects/' + req.params.pid);
  });


  // EMBED --------------------------------
  app.get('/embed/projects/:pid', metas.project, embedStack);
  app.get('/embed/dashboards/:dashboard', metas.dashboard, embedStack);

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


// Check Subdomain

var hasSubDomain_GoDashboard = function(req, res, next){
  if (req.subdomains.length > 0) {
    var protocol = req.socket.encrypted ? 'https' : 'http';
    return res.redirect(protocol + '://' + appHost + '/dashboards/' + req.subdomains[0]);
  }

  next();
};

var hasSubDomain_RemoveIt = function(req, res, next){
  if (req.subdomains.length > 0) {
    var protocol = req.socket.encrypted ? 'https' : 'http';
    return res.redirect(protocol + '://' + appHost + req.originalUrl);
  }

  next();
};
