
var app = module.parent.exports.app
  , passport = require('passport')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project');

var isAuth = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.end('Not authorized', 403);
};

var isProjectLeader = function(req, res, next){
  Project.findById(req.params.project_id, function(err, project){
    if(err || !project) return res.end('Internal server error', 500);

    req.project = project;
    if(project && project.leader === req.user._id) next();
    else res.end('Not authorized', 403);
  });
};

app.get('/', function(req, res){
  res.redirect('/dashboard');
});

app.get('/dashboard', function(req, res){
  Project.find({}).populate('contributors').exec(function(err, projects){
    res.render('dashboard', {projects: projects, user: req.user || {username: ''}});
  });
});

app.post('/projects/new', isAuth, function(req, res){
  if(req.body.title && req.body.description){
    var project_data = {
        title: req.body.title
      , description: req.body.description
      , link: req.body.link
      , tags: req.body.tags.split(',') || []
      , created_at: Date.now()
      , leader: req.user._id
      , followers: [req.user._id]
      , contributors: [req.user._id]
    };

    var project = new Project(project_data);
    project.save(function(){
      res.redirect('/dashboard');
    });

  } else {
    res.redirect('/dashboard');
  }
});

app.get('/projects/:project_id/join', isAuth, function(req, res){
  Project.findById(req.params.project_id, function(error, project){
    if(error || !project) return res.end('server error', 500);

    if(!~project.pending.indexOf(req.user._id) || !~project.contributors.indexOf(req.user._id)) {
      res.end('1');
    } else {
      project.pending.push(req.user._id);
      project.save(function(){
        res.end('1');
      });
    }  
  });
});

app.get('/projects/:project_id/leave', isAuth, function(req, res){
  Project.findById(req.params.project_id, function(error, project){
    if(error || !project) return res.end('server error', 500);

    if(!~project.contributors.indexOf(req.user._id)) {
      project.contributors.splice(project.contributors.indexOf(req.user._id), 1);
      project.save(function(){
        res.end('2');
      });
    } else if(!~project.pending.indexOf(req.user.username) !== -1) {
      project.pending.splice(project.pending.indexOf(req.user._id), 1);
      project.save(function(){
        res.end('2');
      });
    } else {
      res.end('2');
    }   
  });
});

app.get('/project/:project_id/accept/:user_id', isProjectLeader, function(req, res){
  var project = req.project;
  if(!~project.pending.indexOf(req.params.user_id)) {
        res.end('2');
   } else {
    project.contributors.push(req.params.user_id);
    project.pending.splice(project.pending.indexOf(req.params.user_id), 1);
    project.save(function(){
      res.end('3');
    });
  } 
});

app.get('/project/:project_id/decline/:user_id', isProjectLeader, function(req, res){
  var project = req.project;
  if(!~project.pending.indexOf(req.params.user_id)) {
    res.end('2');
  } else {
    project.pending.splice(project.pending.indexOf(req.params.user_id), 1);
    project.save(function(){
      res.end('3');
    });
  } 
});

app.get('/p/:project_id', function(req, res){
  Project.findById(req.params.project_id).populate('contributors').exec(function(err, project){
    res.render('project', {project: project, user: req.user});
  });
});

app.get('/auth/twitter',
  passport.authenticate('twitter')
);

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res){
    res.redirect('/dashboard');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
