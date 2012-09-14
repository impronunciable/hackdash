
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
