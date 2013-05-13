var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../config.json')
  , _ = require('underscore')
  , fs = require('fs')
  , request = require('superagent');

var User = mongoose.model('User')
  , Project = mongoose.model('Project');

module.exports = function(app) {

  app.get('/api/projects', loadProjects, render('projects'));

  app.post('/api/projects/create', isAuth, validateProject, saveProject, notify(app, 'project_created'), gracefulRes);

  app.get('/api/projects/remove/:project_id', isAuth, isProjectLeader, removeProject, notify(app, 'project_removed'), gracefulRes);

  app.get('/api/projects/create', isAuth, setViewVar('statuses', app.get('statuses')), render('new_project'));

  app.post('/api/cover', isAuth, uploadCover);

  app.get('/api/projects/edit/:project_id', isAuth, setViewVar('statuses', app.get('statuses')), isProjectLeader, loadProject, render('edit'));

  app.post('/api/projects/edit/:project_id', isAuth, isProjectLeader, validateProject, updateProject, notify(app, 'project_edited'), gracefulRes);

  app.get('/api/projects/join/:project_id', isAuth, joinProject, followProject, loadProject, notify(app, 'project_join'), gracefulRes); 

  app.get('/api/projects/leave/:project_id', isAuth, isProjectMember, leaveProject, loadProject, notify(app, 'project_leave'), gracefulRes); 

  app.get('/api/projects/follow/:project_id', isAuth, followProject, loadProject, notify(app, 'project_follow'), gracefulRes); 

  app.get('/api/projects/unfollow/:project_id', isAuth, isProjectFollower, unfollowProject, loadProject, notify(app, 'project_unfollow'), gracefulRes); 

  app.get('/api/p/:project_id', loadProject, render('project_full'));

  app.get('/api/search', prepareSearchQuery, loadProjects, render('projects'));

};


/*
 * Render templates
 */
var render = function(path) {
  return function(req, res) { 
    res.render(path, function(err, html){
      if(err) return res.send(500);
      res.json({html: html});
    });
  };
};


/*
 * Render jade view
 */
var renderView = function(path) {
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
 * Emit a notification
 */

var notify = function(app, type) {
	return function(req, res, next) {
		app.emit('post', 
			{type: type, project: res.locals.project, user: req.user
		});
		next();
	}
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
  Project.findOne({ _id: req.params.project_id }, function(err, project) {
    if (err || !project) return res.send(404);
    if (!req.user.is_admin && req.user.id != project.leader) return res.send(401);
    req.project = project;
    next();
  });
};

/*
 * Load all projects
 */

var loadProjects = function(req, res, next) {
  Project.find(req.query || {})
  .populate('contributors')
  .populate('followers')
  .populate('leader')
  .exec(function(err, projects) {
    if(err) return res.send(500);
    res.locals.projects = projects;
    res.locals.user = req.user;
    res.locals.userExists = userExistsInArray;
    next();
  });
};

/*
 * Load specific project
 */

var loadProject = function(req, res, next) {
  Project.findById(req.params.project_id)
  .populate('contributors')
  .populate('followers')
  .populate('leader')
  .exec(function(err, project) {
    if(err || !project) return res.send(500);
    res.locals.project = project;
    res.locals.user = req.user;
    res.locals.disqus_shortname = config.disqus_shortname;
    res.locals.userExists = userExistsInArray;
    next();
  });
};

var userExistsInArray = function(user, arr){
  return _.find(arr, function(u){
    return (u.id == user.id);
  });
};

/*
 * Load searched projects
 * TODO: use mongoose plugin for keywords
 */

var prepareSearchQuery = function(req, res, next) {
  var regex = new RegExp(req.query.q, 'i');
  var query = {};

  if(!req.query.q.length) return res.redirect('/api/projects');
  if(req.query.type === "title") query['title'] = regex;
  else if(req.query.type === "tag") query['tags'] = regex;
  else return res.send(500);

  req.query = query;

  next();
};

/*
 * Check project fields
 */

var validateProject = function(req, res, next) {
  if(req.body.title && req.body.description) next();
  else res.send(500, "Project Title and Description fields must be complete.");
};

/*
 * Save new project
 */

var saveProject = function(req, res, next) {
  var project = new Project({
      title: req.body.title
    , description: req.body.description
    , link: req.body.link
    , status: req.body.status
    , tags: req.body.tags && req.body.tags.length ? req.body.tags.split(',') : []
    , created_at: Date.now()
    , leader: req.user._id
    , followers: [req.user._id]
    , contributors: [req.user._id]
    , cover: req.body.cover
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

var removeProject = function(req, res, next) {
  res.locals.project = {id: req.project.id, title: req.project.title};
  req.project.remove(function(err){
    if(err) res.send(500);
    else next();
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
  project.status = req.body.status || project.status;
  project.cover = req.body.cover || project.cover;
  project.tags = (req.body.tags && req.body.tags.split(',')) || project.tags;

  project.save(function(err, project){
    if(err) return res.send(500);
    res.locals.project = project;
    next();
  });
};

/*
 * Upload cover if exist
 */

var uploadCover = function(req, res, next) {
  var cover = (req.files && req.files.cover && req.files.cover.type.indexOf('image/') != -1 
    && '/uploads/' + req.files.cover.path.split('/').pop() + '.' + req.files.cover.name.split('.').pop());

  if(req.files && req.files.cover && req.files.cover.type.indexOf('image/') != -1) {
    var tmp_path = req.files.cover.path
      , target_path = './public' + cover;

    fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      fs.unlink(tmp_path, function() {
        if (err) throw err;
        res.json({href: cover});
      });
    });
  }
};

/*
 * Check if current user is member of a project
 */

var isProjectMember = function(req, res, next) {
  Project.findOne({_id: req.params.project_id, contributors: req.user.id}, function(err, project){
    if(err || !project) return res.send(500);
    req.project = project;
    next(); 
  });
};

/*
 * Check if current user is follower of a project
 */

var isProjectFollower = function(req, res, next) {
  Project.findOne({_id: req.params.project_id, followers: req.user.id}, function(err, project){
    if(err || !project) return res.send(500);
    req.project = project;
    next(); 
  });
};

 /*
 * Add current user as a group contributor
 */

var joinProject = function(req, res, next) {
  Project.update({_id: req.params.project_id}, { $addToSet : { 'contributors': req.user.id }}, function(err){
    if(err) return res.send(500);
    next();
  });
};

/*
 * Remove current user from a group
 */

var leaveProject = function(req, res, next) {
  Project.update({_id: req.params.project_id}, { $pull: {'contributors': req.user._id }}, function(err){
    if(err) return res.send(500);
    next();
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
 * Return something good
 */

var gracefulRes = function(req, res) {
  res.json({err: null, id: res.locals.project.id});
};
