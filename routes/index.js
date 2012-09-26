
var passport = require('passport')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project');

module.exports = function(app) {
  app.get('/', loadProjects, render('dashboard'));
  app.post('/projects/create', isAuth, validateProject, saveProject, render('project'));
  app.post('/projects/edit/:project_id', isProjectLeader, validateProject, updateProject, render('project'));
  app.get('/projects/:project_id/join', isAuth, isNotProjectMember, joinGroup); 
  app.get('/projects/:project_id/leave', isAuth, isProjectMember, leaveGroup); 
  app.get('/project/:project_id/accept/:user_id', isProjectLeader, isUserPendingMember, acceptUser);
  app.get('/project/:project_id/decline/:user_id', isProjectLeader, isUserPendingMember, declineUser);
  app.get('/p/:project_id', loadProject, render('project'));
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), redirect('/'));
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
 * Check if current user is authenticated
 */

var isAuth = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.send(403);
};

/*
 * Check if current user is project leader
 */

var isProjectLeader = function(req, res, next){
  Project.findById(req.params.project_id, function(err, project){
    if(err || !project) return res.send(500);
    req.project = project;
    if(project.leader === req.user._id) next();
    else res.send(403);
  });
};

/*
 * Load all projects
 */

var loadProjects = function(req, res, next) {
  Project.find({})
  .populate('contributors')
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
  if(req.body.title && req.body.description) next();
  else res.send(500);
};

/*
 * Save new projec
 */

var saveProject = function(req, res, next) {
  var project = new Project({
      title: req.body.title
    , description: req.body.description
    , link: req.body.link
    , tags: req.body.tags.split(',') || []
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
 * Update existing project
 */

var updateProject = function(req, res, next) {
  var project = req.project;
  project.title = req.body.title || project.title;
  project.description = req.body.description || project.description;
  project.link = req.body.link || project.link;
  project.tags = req.body.tags.split(',') || project.tags;
  project.save(function(err, project){
    if(err) return res.send(500);
    res.locals.project = project;
    next();
  });
};

/*
 * Check if current user is member of a group
 */

var isProjectMember = function(req, res, next) {
  Project.findById(req.params.project_id, function(error, project){
    req.project = project;
    if(error || !project) return res.send(500);
    if(~project.pending.indexOf(req.user._id) 
    && ~project.contributors.indexOf(req.user._id)) return res.send(500);

    next(); 
  });
};


/*
 * Check if specific user is not a group member
 */

var isNotProjectMember = function(req, res, next) {
  Project.findById(req.params.project_id, function(error, project){
    req.project = project;
    if(error || !project) return res.send(500);
    if(!~project.pending.indexOf(req.user._id) 
    || !~project.contributors.indexOf(req.user._id)) return res.send(500);

    next(); 
  });
};


/*
 * Check if current user is pending on a group
 */

var isUserPendingMember = function(req, res, next) {
  if(~project.pending.indexOf(req.params.user_id)) res.send(500);
  else next(); 
};

/*
 * Check if specific user is a group contributor
 */

var isUserContributor = function(req, res, next) {
  if(~project.contributors.indexOf(req.params.user_id)) res.send(500);
  else next(); 
};

/*
 * Add current user as pending on a group
 */

var joinGroup = function(req, res) {
  req.project.pending.push(req.user._id);  
  req.project.save(function(err){
    if(err) return res.send(500);
    res.send(200, req.user._id);
  });
};

/*
 * Remove current user from a group
 */

var leaveGroup = function(req, res) {
  req.project.pending.splice(req.project.pending.indexOf(req.user._id), 1);  
  req.project.contributors.splice(req.project.pending.indexOf(req.user._id), 1);  
  req.project.save(function(err){
    if(err) return res.send(500);
    res.send(200, req.user._id);
  });
};

/*
 * Accept a user into a group
 */

var acceptUser = function(req, res, next) {
  req.project.pending.splice(req.project.pending.indexOf(req.params.user_id), 1);  
  req.project.contributors.push(req.params.user_id);  
  req.project.save(function(err, project){
    if(err) return res.send(500);
    res.send(200, req.params.user_id);
  });
};

/*
 * Decline a user group request
 */

var declineUser = function(req, res, next) {
  req.project.pending.splice(req.project.pending.indexOf(req.params.user_id), 1);  
  req.project.save(function(err, project){
    if(err) return res.send(500);
    res.send(200, req.params.user_id);
  });
};

/*
 * Log out current user
 */

var logout = function(req, res, next) {
  req.logout();
  next();
};
