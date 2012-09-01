
var app = module.parent.exports.app
  , passport = require('passport')
  , mongoose = require('mongoose');

var User = mongoose.model('User')
  , Project = mongoose.model('Project');

var isAuth = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.redirect('/');
};

var isOwner = function(req, res, next){
  Project.findById(req.params.project_id, function(err, project){
    if(project && project.leader === req.user.id) next();
    else res.redirect('back');
  });
};

app.get('/', function(req, res){
  res.redirect('/dashboard');
});

app.get('/dashboard', function(req, res){
  Project.find({}, function(err, projects){
    res.render('dashboard', {projects: projects, user: req.user || {username: ''}});
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
