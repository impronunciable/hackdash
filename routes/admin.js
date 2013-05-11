
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

  app.get('/install', isAuth, notInstalled, render('installed'));
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

/*
 * Check if not installed
 */

var notInstalled = function(req, res, next) {
  Dashboard.findOne({ 'admin': { $exists: true } }, function(err, dash){
    if(!dash || (dash.admin == req.user.id && !req.user.is_admin)) {
      if (!dash) {
        dash = new Dashboard({ admin: req.user.id });
        dash.save(function(){
          if(err) return res.send(500);
        });
      }
      res.locals.user = req.user;
      req.user.is_admin = true;
      req.user.save(function(){
        if(err) return res.send(500);
        next();
      });
    }
    else res.redirect('/'); 
  });   
};
