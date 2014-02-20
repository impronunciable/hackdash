
/*
 * RESTfull API
 * 
 * 
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../config.json');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

var apiVersion = "v2";

module.exports = function(app) {

  var uri = '/api/' + apiVersion;

  //Dashboard

  app.get(uri + '/', getDashboard, sendDashboard);
  app.put(uri + '/', isAuth, getDashboard, canChangeDashboard, updateDashboard, sendDashboard);

  app.post(uri + '/', notAllowed);
  app.del(uri + '/', notAllowed);

  // Projects

  app.get(uri + '/projects', setQuery, setProjects, sendProjects);
  app.del(uri + '/projects/:pid', isAuth, getProject, canChangeProject, removeProject);
  app.put(uri + '/projects/:pid', isAuth, getProject, canChangeProject, updateProjects, sendProjects);
  
  app.post(uri + '/projects/:pid/followers', isAuth, getProject, validate, addFollower);
  app.del(uri + '/projects/:pid/followers', isAuth, getProject, validate, removeFollower);

  app.post(uri + '/projects/:pid/contributors', isAuth, getProject, validate, addContributor);
  app.del(uri + '/projects/:pid/contributors', isAuth, getProject, validate, removeContributor);

};

var notAllowed = function(req, res){
  res.send(405); //Not Allowd
};

var getDashboard = function(req, res, next){
  if (req.subdomains.length > 0) {
    Dashboard.findOne({ domain: req.subdomains[0] })
      .exec(function(err, dashboard) {
        if(err) return res.send(500);
        if(!dashboard) return res.send(404);
        req.dashboard = dashboard;
        next();
      });
  }
  else {
    res.send(400, "Expected to be called at a subdomain");
  } 
}

var canChangeDashboard = function(req, res, next){
  var isAdmin = (req.user.admin_in.indexOf(req.dashboard.domain) >= 0);

  if (!isAdmin) {
    return res.send(403, "Only Administrators edit this dashboard.");
  }

  next();
};

var updateDashboard = function(req, res, next) {
  var dashboard = req.dashboard;

  if(req.body.link && req.body.link.indexOf('http') != 0) {
    req.body.link = 'http://' + req.body.link;
  }

  dashboard.title = req.body.title || dashboard.title;
  dashboard.description = req.body.description || dashboard.description;
  dashboard.link = req.body.link || dashboard.link;
  
  dashboard.save(function(err, dashboard){
    if(err) return res.send(500);
    req.dashboard = dashboard;
    next();
  });
};

var sendDashboard = function(req, res){
  res.send(req.dashboard);
};


var getProject = function(req, res, next){
  Project.findById(req.params.pid)
    .populate('leader')
    .exec(function(err, project) {
      if (err) return res.send(500);
      if (!project) return res.send(404);

      req.project = project;
      next();
  });
};

var isAuth = function(req, res, next){
  if (!req.isAuthenticated()){
    return res.send(401, "User not authenticated");
  }

  next();
};

var canChangeProject = function(req, res, next){

  var isLeader = req.user.id === req.project.leader.id;
  var isAdmin = (req.project.domain && req.user.admin_in.indexOf(req.project.domain) >= 0);

  if (!isLeader && !isAdmin) {
    return res.send(403, "Only Leader or Administrators can edit or remove this project.");
  }

  next();
};

var updateProjects = function(req, res, next) {
  var project = req.project;

  project.active = req.body.hasOwnProperty("active") ? req.body.active : project.active;
  
  project.save(function(err, project){
    if(err) return res.send(500);
    req.project = project;
    next();
  });
};

var removeProject = function(req, res){
  req.project.remove(function (err){
    if (err) return res.send(500, "An error ocurred when removing this project");
    res.send(204); //all good, no content
  });
};

// TODO: change this validations for external API access.
var validate = function(req, res, next){
  var user = req.user;
  var project = req.project;

  if ((project.domain && user.admin_in.indexOf(project.domain) >= 0) || user._id === project.leader.id ){
    return res.send(406, "Leader or Admins of the project cannot be followers or contributors.");
  }

  next();
};

var addFollower = function(req, res){
  var projectId = req.params.pid;
  var userId = req.user.id;

  Project.update({_id: projectId}, { $addToSet : { 'followers': userId }}, function(err){
    if(err) return res.send(500);
    res.send(200);
  });
};

var removeFollower = function(req, res){
  var projectId = req.params.pid;
  var userId = req.user.id;

  Project.update({_id: projectId}, { $pull : { 'followers': userId }}, function(err){
    if(err) return res.send(500);
    res.send(200);
  });
};

var addContributor = function(req, res){
  var projectId = req.params.pid;
  var userId = req.user.id;

  Project.update({_id: projectId}, { $addToSet : { 'contributors': userId }}, function(err){
    if(err) return res.send(500);
    res.send(200);
  });
};

var removeContributor = function(req, res){
  var projectId = req.params.pid;
  var userId = req.user.id;

  Project.update({_id: projectId}, { $pull : { 'contributors': userId }}, function(err){
    if(err) return res.send(500);
    res.send(200);
  });
};

var setQuery = function(req, res, next){
  var query = req.query.q || "";

  req.query = {};

  if (req.subdomains.length > 0) {
    req.query = { domain: req.subdomains[0] };
  }

  if (query.length === 0){
    //req.query = { 'contributors.2': { $exists: true } };
    return next();
  }

  var regex = new RegExp(query, 'i');
  req.query.$or = [ { title: regex }, { description: regex } ];

  next();
};

var setProjects = function(req, res, next){
  Project.find(req.query || {})
    .populate('contributors')
    .populate('followers')
    .limit(30)
    .sort( { "created_at" : -1 } )
    .exec(function(err, projects) {
      if(err) return res.send(500);
      res.projects = projects;
      next();
    });
}

var sendProjects = function(req, res){
  res.send(res.projects);
};
