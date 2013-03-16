
var passport = require('passport')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project');

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

  app.get('/', dashboardStack);
  app.get('/login', dashboardStack);
  app.get('/projects/create', dashboardStack);
  app.get('/projects/edit/:project_id', dashboardStack);
  app.get('/p/:project_id', dashboardStack);
  app.get('/search', dashboardStack);
  app.get('/logout', logout, redirect('/'));
  app.get('/about', render('about'));
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
 * Log out current user
 */

var logout = function(req, res, next) {
  req.logout();
  next();
};
