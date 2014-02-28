
var passport = require('passport')
  , config = require('../config.json')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

module.exports = function(app) {

  /*
   * Dashboard middleware stack
   */

  var dashboardStack = [
    dashExists,
    loadUser, 
    loadProviders,
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    render('dashboard')
  ];

  var homeStack = [
    loadUser,
    loadProviders,
    isHomepage,
    dashExists,
    checkProfile,
    setViewVar('statuses', app.get('statuses')),
    setViewVar('disqus_shortname', config.disqus_shortname),
    render('dashboard')
  ];

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

  var hackdashStack = [
    loadUser, 
    loadProviders,
    setViewVar('host', appHost),
    setViewVar('version', app.get('clientVersion'))
  ];

  var hackdashDashboardStack = [
    loadUser, 
    loadProviders,
    isHomepage,
    dashExists,
    checkProfile,
    setViewVar('host', appHost),
    setViewVar('version', app.get('clientVersion'))
  ];

  var hackdashProfileStack = [
    loadUser, 
    loadProviders,
    setViewVar('host', appHost),
    setViewVar('version', app.get('clientVersion'))
  ];

  app.get('/', hackdashDashboardStack, setViewVar('app_type', 'dashboard'), render('hackdashApp'));
  app.get('/search', hackdashDashboardStack, setViewVar('app_type', 'dashboard'), render('hackdashApp'));

  //app.get('/', homeStack); // X
  app.get('/live', liveStack);
  app.get('/login', dashboardStack); // X
  app.get('/sort', dashboardStack); // X
  app.get('/projects/create', dashboardStack);
  app.get('/sort/:type', dashboardStack);
  app.get('/projects/edit/:project_id', dashboardStack);
  app.get('/p/:project_id', dashboardStack);
  //app.get('/search', dashboardStack); // X
  app.get('/logout', logout, redirect('/'));
  
  app.get('/about', loadUser, render('about'));

  //app.get('/users/profile', dashboardStack);
  //app.get('/users/:user_id', dashboardStack);

  app.get('/users/profile', function(req, res){
    res.redirect('/users/' + req.user._id);
  });

  app.get('/users/:user_id', hackdashProfileStack, setViewVar('app_type', 'profile'), render('hackdashApp'));

  app.post('/dashboard/create', isAuth, validateSubdomain, createDashboard(app));

  app.get('/isearch', hackdashStack, setViewVar('app_type', 'isearch'), render('hackdashApp'));
  app.get('/csearch', hackdashStack, setViewVar('app_type', 'csearch'), render('hackdashApp'));
  app.get('/dashboards', hackdashStack, setViewVar('app_type', 'dashboards'), render('hackdashApp'));
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
    res.redirect('/users/' + req.user._id);
    //res.redirect('/users/profile');
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

var isHomepage = function(req, res, next) {
  var url = config.host + (config.port === 80 ? "" : ":" + config.port);

  if(!req.subdomains.length) {
    Dashboard.find({}).sort('domain').exec(function(err, dashboards){
       res.render('homepage', {dashboards: dashboards, baseHost: url });
    });
  } else {
    next();
  }
};

var validateSubdomain = function(req, res, next) {
  if(!/^[a-z0-9]{5,10}$/.test(req.body.domain)) return res.send(500);
  
  next();
};

/*
 * Create a new dashboard
 */

var createDashboard =  function(app){
return function(req, res) {
  Dashboard.findOne({domain: req.body.domain}, function(err, dashboard){
    if(err || dashboard) return res.send('The sudbomain is in use.');

    var dash = new Dashboard({ domain: req.body.domain});
    dash.save(function(err){
      
      User.findById(req.user.id, function(err, user) {
        user.admin_in.push(req.body.domain);
        user.save(function(){
          res.redirect('http://' + req.body.domain + '.' + app.get('config').host + ':' + app.get('config').port);
        });
      });

    });
  });
};
};


var dashExists = function(req, res, next) {
  Dashboard.findOne({ domain: req.subdomains[0] }, function(err, dash) {
    if (err || !dash) return res.send(404);
    res.locals.dashboard = dash;
    next();
  });
};
