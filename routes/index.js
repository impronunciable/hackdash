
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
  app.get('/projects/create', dashboardStack);
  app.get('/projects/edit/:project_id', dashboardStack);
  app.get('/p/:project_id', dashboardStack);
  app.get('/search', dashboardStack);
  app.post('/projects/create', isAuth, validateProject, saveProject, redirect('/'));
  app.get('/api/projects', loadProjects, render('projects'));
  app.get('/api/projects/remove/:project_id', isAuth, isProjectLeader, removeProject);
  app.get('/api/projects/create', isAuth, setViewVar('statuses', app.get('statuses')), render('new_project'));
  app.get('/api/projects/edit/:project_id', isAuth, setViewVar('statuses', app.get('statuses')), isProjectLeader, loadProject, render('edit'));
  app.post('/projects/edit/:project_id', isAuth, isProjectLeader, validateProject, updateProject, redirect('/'));
  app.get('/api/projects/:project_id/join', isAuth, joinProject); 
  app.get('/api/projects/:project_id/leave', isAuth, isProjectMember, leaveProject); 
  app.get('/api/projects/:project_id/follow', isAuth, followProject, loadProject, render('project')); 
  app.get('/api/projects/:project_id/unfollow', isAuth, unfollowProject, loadProject, render('project')); 
  app.get('/api/p/:project_id', loadProject, render('project_full'));
  app.get('/api/search', loadSearchProjects, render('projects'));
  app.get('/logout', logout, redirect('/'));
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
 * Check if current user is authenticated
 */

var isAuth = function(req, res, next){
  (req.isAuthenticated()) ? next() : res.send(403);
};

/*
 * Check if current user is project leader
 */

var isProjectLeader = function(req, res, next){
  Project.findOne({_id: req.params.project_id, leader: req.user.id}, function(err, project){
    if(err || !project) return res.send(500);
    req.project = project;
    next();
  });
};

/*
 * Load all projects
 */

var loadProjects = function(req, res, next) {
  Project.find({})
  .populate('contributors')
  .populate('leader')
  .exec(function(err, projects) {
    if(err) return res.send(500);
    res.locals.projects = projects;
    res.locals.user = req.user;
    next();
  });
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
 * Load searched projects
 * TODO: use mongoose plugin for keywords
 */

var loadSearchProjects = function(req, res, next) {
  var regex = new RegExp(req.query.q);
  Project
  .find()
  .or([{title: regex}, {summary: regex}, {tags: req.query.q}])
  .exec(function(err, projects) {
    if(err) return res.send(500);
    res.locals.projects = projects;
    res.locals.user = req.user;
    next();
  });
};

/*
 * Check project fields
 */

var validateProject = function(req, res, next) {
  if(req.body.title && req.body.summary) next();
  else res.send(500);
};

/*
 * Save new project
 */

var saveProject = function(req, res, next) {
  var project = new Project({
      title: req.body.title
    , description: req.body.description
    , summary: req.body.summary
    , link: req.body.link
    , status: req.body.status
    , tags: req.body.tags.length ? req.body.tags.split(',') : []
    , created_at: Date.now()
    , leader: req.user._id
    , followers: [req.user._id]
    , contributors: [req.user._id]
  });

  project.save(function(err, project){
    if(err) return res.send(500); 
    res.locals.project = project;
    next();
  });
};

/*
 * Remove a project
 */

var removeProject = function(req, res) {
  req.project.remove(function(err){
    if(err) res.send(500);
    else res.send(200);
  });
};

/*
 * Update existing project
 */

var updateProject = function(req, res, next) {
  var project = req.project;

  project.title = req.body.title || project.title;
  project.description = req.body.description || project.description;
  project.summary = req.body.summary || project.summary;
  project.link = req.body.link || project.link;
  project.status = req.body.status || project.status;
  project.tags = (req.body.tags && req.body.tags.split(',')) || project.tags;

  project.save(function(err, project){
    if(err) return res.send(500);
    res.locals.project = project;
    next();
  });
};

/*
 * Check if current user is member of a project
 */

var isProjectMember = function(req, res, next) {
  Project.findOne({_id: req.params.project_id, contributors: req.user.id}, function(err, project){
    if(error || !project) return res.send(500);

    req.project = project;
    next(); 
  });
};

/*
 * Check if current user is follower of a project
 */

var isProjectFollower = function(req, res, next) {
  Project.findOne({_id: req.params.project_id, followers: req.user.id}, function(error, project){
    if(error || !project) return res.send(500);
    req.project = project;
    next(); 
  });
};

 /*
 * Add current user as a group contributor
 */

var joinProject = function(req, res) {
  Project.update({_id: req.params.project_id}, { $addToSet : { 'contributors': req.user.id }, $addToSet : { 'followers': req.user.id }}, function(err){
    if(err) return res.send(500);
    res.json(200, {group: req.params.project_id, user: req.user._id });
  });
};

/*
 * Remove current user from a group
 */

var leaveProject = function(req, res) {
  Project.update({_id: req.params.project_id}, { $pull: {'contributors': req.user._id }}, function(err){
    if(err) return res.send(500);
    res.json(200, {group: req.params.project_id, user: req.user._id });
  });
};

/*
 * Add current user as project follower
 */

var followProject = function(req, res, next) {
  Project.update({_id: req.params.project_id}, { $addToSet : { 'followers': req.user.id }}, function(err){
    if(err) return res.send(500);
    next();
  });
};

/*
 * Unfollow
 */

var unfollowProject = function(req, res, next) {
  Project.update({_id: req.params.project_id},{ $pull: {'followers': req.user._id }}, function(err){
    if(err) return res.send(500);
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
