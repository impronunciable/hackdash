
var app = module.parent.exports.app
  , passport = require('passport')
  , client = module.parent.exports.client;

var isAuth = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.redirect('/');
};

var isOwner = function(req, res, next){
  client.get('projects:' + req.params.id, function(err, project){
    project = JSON.parse(project);
    if(project && project.owner_id == req.user.id) next();
    else res.redirect('back');
  });
};

app.get('/', function(req, res){
  if(req.isAuthenticated()){
    res.redirect('/dashboard');
  } else {
    res.render('index');
  }
});

app.get('/dashboard', isAuth, function(req, res){
  client.keys('projects:*', function(err, keys){
    client.mget(keys, function(err, projects){

      projects = projects || [];      

      projects = projects.map(function(project){
        return JSON.parse(project);
      });
  
      res.render('dashboard', {projects: projects, user: req.user});
    });
  });
});

app.get('/projects/join/:id', function(req, res){
  if(!req.isAuthenticated()){
    res.end('0');
  } else {
    client.get('projects:' + req.params.id, function(err, project) {
      project = JSON.parse(project);
      if(project.contributors.indexOf(req.user.username) !== -1) {
        res.end('1');
      } else {
        project.contributors.push(req.user.username);
        client.set('projects:' + req.params.id, JSON.stringify(project), function(){
          res.end('1');
        });
      }  
    });
  } 
});


app.get('/projects/leave/:id', function(req, res){
  if(!req.isAuthenticated()){
    res.end('0');
  } else {
    client.get('projects:' + req.params.id, function(err, project) {
      project = JSON.parse(project);
      if(project.contributors.indexOf(req.user.username) !== -1 && project.owner_id != req.user.id) {
        project.contributors.splice(project.contributors.indexOf(req.user.username), 1);
        client.set('projects:' + req.params.id, JSON.stringify(project), function(){
          res.end('2');
        });
      } else {
        res.end('2');
      }  
    });
  } 
});

app.post('/projects/new', isAuth, function(req, res){
  if(req.body.title && req.body.description){
    var hash = Math.floor(Math.random() * 9999999 + 1);
    var project = {
        id: hash
      , title: req.body.title
      , owner_id: req.user.id
      , owner_username: req.user.username
      , description: req.body.description
      , repo: req.body.repo || ''
      , contributors: [req.user.username]
    };

    client.set('projects:' + hash, JSON.stringify(project), function(){
      res.redirect('back');
    });

  } else {
    res.redirect('back');
  }
});

app.get('/projects/edit/:id', isAuth, isOwner, function(req, res){
  client.get('projects:' + req.params.id, function(err, project){
    project = JSON.parse(project);
    res.render('edit', {project: project});
  });
});

app.post('/projects/edit/:id', isAuth, isOwner, function(req, res){
  if(req.body.title && req.body.description){
    client.get('projects:' + req.params.id, function(err, project){
      project = JSON.parse(project);

      project.title = req.body.title;
      project.description = req.body.description;

      client.set('projects:' + req.params.id, JSON.stringify(project), function(){
        res.redirect('back');
      });
    });
  } else {

  }
});

app.get('/projects/remove/:id', isAuth, isOwner, function(req, res){
  client.del('projects:' + req.params.id, function(err){
    res.redirect('back');
  });
});

app.get('/auth/twitter',
  passport.authenticate('twitter')
);

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res){
    res.redirect('/dashboard');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
