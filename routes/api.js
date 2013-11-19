var passport = require('passport')
  , mongoose = require('mongoose')
  , moment = require('moment')
  , config = require('../config.json')
  , _ = require('underscore')
  , fs = require('fs')
  , request = require('superagent');

moment.lang('es');
var User = mongoose.model('User')
  , Project = mongoose.model('Project');
var site_root = '';
module.exports = function(app) {
  site_root = app.get('config').host;
  app.locals.canCreate = userCanCreate
  app.locals.stageCanCreate = stageCanCreate
  app.get('/api/projects', loadProjects, render('projects'));
  app.post('/api/projects/create', isAuth, canCreate, validateProject, saveProject, notify(app, 'project_created'), gracefulRes());
  app.get('/api/projects/remove/:project_id', isAuth, canRemove, removeProject, notify(app, 'project_removed'), gracefulRes());
  app.get('/api/projects/create', isAuth, canCreate, setViewVar('statuses', app.get('statuses')), render('new_project'));
  app.post('/api/cover', isAuth,  uploadCover);
  app.get('/api/projects/edit/:project_id', isAuth, setViewVar('statuses', app.get('statuses')), canEdit, loadProject, render('edit'));
  app.post('/api/projects/edit/:project_id', isAuth, canEdit, validateProject, updateProject, notify(app, 'project_edited'), gracefulRes());
  app.get('/api/projects/join/:project_id', isAuth, joinProject, followProject, loadProject, notify(app, 'project_join'), sendMail(app, 'join'), gracefulRes()); 
  app.get('/api/projects/leave/:project_id', isAuth, isProjectMemberOrApplicant, leaveProject, loadProject, gracefulRes()); 
  app.get('/api/projects/follow/:project_id', canVote, isAuth, followProject, loadProject, notify(app, 'project_follow'), gracefulRes()); 
  app.get('/api/projects/unfollow/:project_id', isAuth, isProjectFollower, unfollowProject, loadProject, notify(app, 'project_unfollow'), gracefulRes()); 
  app.get('/api/p/:project_id', loadProject, canView, render('project_full'));
  app.get('/api/search', prepareSearchQuery, loadProjects, render('projects'));
  app.get('/api/users/applicants', isAuth, loadApplicants, render('applicants'));
  app.get('/api/users/profile', isAuth, loadUser, userIsProfile, render('edit_profile'));
  app.get('/api/users/:user_id', loadUser, findUser, render('profile'));
  app.post('/api/users/:user_id', isAuth, updateUser, gracefulRes('ok!'));
  app.put('/api/users/applicants/:project_id/:user_id', isAuth, canApprove, joinApprove, loadProject, gracefulRes()); 
  app.del('/api/users/applicants/:project_id/:user_id', isAuth, canApprove, joinReject, loadProject, gracefulRes()); 
};

/*
 * Render templates
 */
var render = function(path) {
  return function(req, res) { 
    res.render(path, function(err, html){
      console.log(err);
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
		app.emit('post', {type: type, project: res.locals.project, user: req.user});
		next();
	};
};

/**
 * Send email
 */

var sendMail = function(app, type) {
	return function(req, res, next) {
		if(!app.get('config').mailer) return next();
		app.emit('mail', {
			type: type,
			from: req.user,
			to: res.locals.project.leader,
			project: res.locals.project
		});
		next();
	};
};

/*
 * Add current user template variable
 */

var loadUser = function(req, res, next) {
  res.locals.user = req.user;
  next();
};

/**
 * Add a user info to the response
 */

var findUser = function(req, res, next){
  User.findById(req.params.user_id, function(err, user){
    if(err) return res.send(404);
    res.locals.user_profile = user;
    next();
  });
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

var userIsProfile = function(req, res, next) {
  res.locals.user_profile = req.user;
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
 * Check if current user can create Projects
 */

var canCreate = function(req, res, next) {
  if (!userCanCreate(req.user)){
    return res.send(401)
  }else{
    Project.find({leader:req.user._id})
    .exec(function(err, project) {
      if(project.length){
        return res.send(401)
      }else{
        next();
      }
    })
  }
}

/*
 * Check if current user can remove this project.
 */

var canRemove = function(req, res, next) {
  return canPermission(req, res, next, 'remove')
}

/*
 * Check if current user can edit this project.
 */

var canEdit = function(req, res, next) { 
  return canPermission(req, res, next, 'edit')
}

/*
 * Check if current user can view this project.
 */

var canView = function(req, res, next) {
  return canPermission(req, res, next, 'view')
}

/*
 * Check if current user can approve this applicant.
 */

var canApprove = function(req, res, next) {
  return canPermission(req, res, next, 'approve')
}

var canVote = function(req, res, next) {
  return canPermission(req, res, next, 'vote');
}
/*
 * Check if current user can do the selected action. 
 * Being posible values ['edit', 'remove', 'view']
 */

var canPermission = function(req, res, next, action){
  Project.findById(req.params.project_id)
  .populate('leader')
  .exec(function(err, project) {
    if (err || !project) return res.send(404);
    switch ( action ) {
      case 'edit':
        if (!userCanEdit(req.user, project))
          return res.send(401);
        break;
      case 'remove':
        if (!userCanRemove(req.user, project))
          return res.send(401);
        break;
      case 'view':
        if (!userCanView(req.user, project))
          return res.send(401);
        break;
      case 'approve':
        if (!userCanApprove(req.user, project))
          return res.send(401);
        break;
      case 'vote':
        if (!userCanVote(req.user, project))
          return res.send(401);
        break;        
      default:
        return res.send(401);
        break;
    }
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
  .populate('applicants')  
  .populate('followers')
  .populate('leader')
  .exec(function(err, projects) {
    if(err) return res.send(500);
    res.locals.projects = projects;
    res.locals.user = req.user;
    res.locals.canView = userCanView;
    res.locals.canEdit = userCanEdit;
    res.locals.canVote = userCanVote;
    res.locals.canRemove = userCanRemove;
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
  .populate('applicants')
  .populate('followers')
  .populate('leader')
  .exec(function(err, project) {
    if(err || !project) return res.send(500);
    res.locals.project = project;
    res.locals.user = req.user;
    res.locals.canEdit = userCanEdit;
    res.locals.canVote = userCanVote;
    res.locals.canRemove = userCanRemove;
    res.locals.disqus_shortname = config.disqus_shortname;
    res.locals.userExists = userExistsInArray;
    next();
  });
};

/*
 * Load applicants
 */

var loadApplicants = function(req, res, next) {
  Project.find({leader:req.user._id})
  .populate('contributors')
  .populate('applicants')
  .populate('followers')
  .populate('leader')
  .exec(function(err, projects) {
    if(err || !projects) return res.send(500);
    var applicants = [];
    applicants = _.reduceRight(_.pluck(projects,'applicants'), function(a, b) { return a.concat(b); }, []);
    res.locals.applicants = applicants;          
    res.locals.projects = projects;
    res.locals.user = req.user;
    res.locals.canEdit = userCanEdit;
    res.locals.canVote = userCanVote;
    res.locals.canRemove = userCanRemove;
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

  if(!req.query.q.length) return res.redirect('/2013/apps/api/projects');
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
    , link: (/^http[s]?\:\/\//.test(req.body.link))? req.body.link : "http://" + req.body.link
    , status: req.body.status
    , tags: req.body.tags && req.body.tags.length ? req.body.tags.split(',') : []
    , hashtag: req.body.hashtag
    , created_at: Date.now()
    , leader: req.user._id
    , dataset: req.body.dataset
    , followers: [req.user._id]
    , contributors: [req.user._id]
    , cover: req.body.cover
    , video: req.body.video
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
  project.dataset = req.body.dataset || project.dataset;
  project.cover = req.body.cover || project.cover;
  project.tags = (req.body.tags && req.body.tags.split(',')) || project.tags;
  project.video = req.body.video || project.video;

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
        res.json({href: '/2013/apps' + cover});
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
 * Check if current user is member of a project or applicant
 */

var isProjectMemberOrApplicant = function(req, res, next) {
  Project.findOne({_id: req.params.project_id, $or: [ {contributors: req.user.id}, {applicants: req.user.id}]}, function(err, project){
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
 * Add current user to applicants
 */

var joinProject = function(req, res, next) {
  var g = (config['join_approval'])? {'applicants': req.user.id} : {'contributors': req.user.id };
  Project.update({_id: req.params.project_id}, { $addToSet : g }, function(err){
    if(err) return res.send(500);
    next();
  });
};

 /*
 * Add applicant to contributors
 */

var joinApprove = function(req, res, next) {
    Project.update({_id: req.params.project_id}, { $addToSet : { 'contributors': req.params.user_id }, $pull : { 'applicants': req.params.user_id }}, function(err, count, raw){
      if(err) return res.send(500);
      next();
    });
};

 /*
 * Remove from applicant group
 */

var joinReject = function(req, res, next) {
  Project.update({_id: req.params.project_id}, { $pull : { 'applicants': req.params.user_id }}, function(err, count, raw){
    if(err) return res.send(500);
    next();
  });
};

/*
 * Remove current user from a group
 */

var leaveProject = function(req, res, next) {
  Project.update({_id: req.params.project_id}, { $pull: {'contributors': req.user._id, 'applicants': req.user._id }}, function(err){
      if(err) return res.send(500);
      next()
  });
};

/*
 * Add current user as project follower
 */

var followProject = function(req, res, next) {
  console.log('follow');
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

var gracefulRes = function(msg) {
  return function(req, res) {
    res.json(msg && {msg: msg} ||{err: null, id: res.locals.project.id});
  };
};


/*
 *  Returns the first stage that wraps the actual time
 */

var actualStage = function() {
  if (config['stages']) {
    momentNow = moment(Date())
    for ( var i = 0; i < config['stages'].length; i++ ) {
      var stageStart = config['stages'][i]['start'];
      var stageEnd = config['stages'][i]['end'];
      var isBeforeEnd = !stageEnd || momentNow.isBefore(stageEnd);
      var isAfterStart = !stageStart || momentNow.isAfter(stageStart);
      if (isBeforeEnd && isAfterStart)
        return config['stages'][i]
    }
  }
}

/*
 * Check an stage for permissions
 */

var stageHasPermission = function(stage, permission) {
  if (!stage) 
    return false;

  return _.find(stage['permissions'], function(u){
    return (u == permission);
  });
}

/*
 * Tells if the actual stage has permissions to create
 */

var stageCanCreate = function() {
  return stageHasPermission(actualStage(), 'create');
}


/*
 * Tells if the user can vote projects
 */

var userCanVote = function(user, project) {
    // Anonymous can't vote
    if ( !user )
      return false;
    console.log('hay user');
    if(userExistsInArray(user, project.followers ))
      return false;
    
    return stageHasPermission(actualStage(), 'vote');
}

/*
 * Tells if the user can create projects
 */

var userCanCreate = function(user) {
  // Anonymous can't create
  if ( !user )
    return false;

  // Admin, always can create
  if (user.is_admin) 
    return true;

  // If we are on no stage (and not admin) user can't create
  var stage = actualStage();
  if (!stage)
    return false;

  // Otherwise, it dependes on the stage
  return stageHasPermission(stage, 'create')
};

/*
 * Tells if the user can remove a project
 */

var userCanRemove = function(user, project) {
  // Anonymous can't remove
  if (!user)
    return false;

  // Admin, always can remove
  if (user.is_admin)
    return true;

  // If we are on no stage (and not admin) user can't remove
  var stage = actualStage();
  if (!stage)
    return false;

  // If stage has no permission to create, then no permission to remove
  if ( !stageHasPermission(stage, 'create') )
    return false;

  // If stage has permission but the user is not leader, then user can't remove
  if (user.id !== project.leader.id )
    return false;

  // Otherwise (not admin, stage with permission, and leader), user can remove!! :D
  return true;
}

/*
 * Tells if the user can edit a project
 */

var userCanEdit = function(user, project) {
  // Anonymous can't edit
  if ( !user )
    return false;

  // Admin, always can edit
  if (user.is_admin)
    return true;

  // If we are on no stage (and not admin) user can't edit
  var stage = actualStage();
  if ( !stage )
    return false;

  // If the stage has no permission to edit or create user can't edit
  if ( !stageHasPermission(stage, 'edit') && !stageHasPermission(stage, 'create'))
    return false;

  // If the stage has permission but the user is not the leader, user can't edit
  if (user.id !== project.leader.id )
    return false;

  // Otherwise (not admin, stage with permission, and leader) user can edit!! :D
  return true;
  
};

/*
 * Tells if the user can view a project
 */

var userCanView = function(user, project) {
  var stage = actualStage()

  // Anonymous user search for permission on stage
  if ( !user ) 
    return stage && stageHasPermission(stage, 'view-anonymous')

  // Admin, always can view
  if (user.is_admin)
    return true;

  // If the user is the leader or a contributor they can always see the project.
  if ( user.id === project.leader.id || userExistsInArray(user, project.contributors ) )
    return true;

  // If we are on no stage (and not admin, and not contributor) user can't view
  if ( !stage )
    return false;

  // Otherwise, it depends on the stage
  return  stageHasPermission(stage, 'view')
}
/*
 * Tells if the user can approve a new project member
 */

var userCanApprove = function(user, project) {

  // Anonymous can't approve
  if ( !user )
    return false;

  // Admin, always can approve
  if (user.is_admin)
    return true;

  // If we are on no stage (and not admin) user can't approve
  var stage = actualStage();
  if ( !stage )
    return false;

  // If the stage has no permission to edit or create user can't approve
  if ( !stageHasPermission(stage, 'edit') && !stageHasPermission(stage, 'create'))
    return false;

  // If the stage has permission but the user is not the leader, user can't approve
  if (user.id !== project.leader.id )
    return false;

  // Otherwise (not admin, stage with permission, and leader) user can approve!! :D
  return true;
  
}