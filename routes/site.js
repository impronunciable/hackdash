
var passport = require('passport')
  , config = require('../config.json')
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
    setViewVar('disqus_shortname', config.disqus_shortname),
    render('dashboard')
  ];

  app.get('/', checkProfile, dashboardStack);
  app.get('/login', dashboardStack);
  app.get('/projects/create', dashboardStack);
  app.get('/projects/edit/:project_id', dashboardStack);
  app.get('/p/:project_id', dashboardStack);
  app.get('/search', dashboardStack);
  app.get('/logout', logout, redirect('/'));
  
  app.get('/about', loadUser, render('about'));

  app.get('/users/profile', isAuth, loadUser, userIsProfile, render('edit_profile'));
  app.get('/users/:user_id', loadUser, findUser, render('profile'));
  app.post('/users/:user_id', isAuth, updateUser, redirect('/'));
  
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
    res.redirect('/users/profile');
  }

  next();
};


var findUser = function(req, res, next){
  User.findById(req.params.user_id, function(err, user){
    if(err) return res.send(404);
    res.locals.user_profile = user;
    next();
  });
};

var userIsProfile = function(req, res, next) {
  res.locals.user_profile = req.user;
  next();
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
 * Update existing User
 */

var updateUser = function(req, res, next) {
  var user = req.user;
  
  user.name = req.body.name;
  user.email = req.body.email;
  user.bio = req.body.bio;

  user.save(function(err, user){
    if(err) {

      res.locals.errors = [];
      if (err.errors.hasOwnProperty('email')){
        res.locals.errors.push('Invalid Email');  
      }

      res.locals.user = req.user;

      res.render('edit_profile');
    }
    else {
      res.locals.user = user;
      next();
    }
  });
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
 * Log out current user
 */

var logout = function(req, res, next) {
  req.logout();
  next();
};
