
var app = module.parent.exports.app
  , passport = require('passport')
  , reds = require('reds')
  , client = module.parent.exports.client;

var search = reds.createSearch('hhba:search');

var isAuth = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.redirect('/');
};

var isOwner = function(req, res, next){
  client.get('hhba:projects:' + req.params.id, function(err, project){
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
  client.keys('hhba:projects:*', function(err, keys){
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
    client.get('hhba:projects:' + req.params.id, function(err, project) {
      project = JSON.parse(project);
      if(project.contributors.indexOf(req.user.username) !== -1 && project.pendent.indexOf(req.user.username) !== -1) {
        res.end('1');
      } else {
        project.pending.push(req.user.username);
        client.set('hhba:projects:' + req.params.id, JSON.stringify(project), function(){
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
    client.get('hhba:projects:' + req.params.id, function(err, project) {
      project = JSON.parse(project);
      if(project.contributors.indexOf(req.user.username) !== -1 && project.owner_id != req.user.id) {
        project.contributors.splice(project.contributors.indexOf(req.user.username), 1);
        client.set('hhba:projects:' + req.params.id, JSON.stringify(project), function(){
          res.end('2');
          search.remove(req.params.id, function(){
            search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
            , req.params.id);
          });
        });
      } else if(project.pending.indexOf(req.user.username) !== -1) {
        project.pending.splice(project.pending.indexOf(req.user.username), 1);
        client.set('hhba:projects:' + req.params.id, JSON.stringify(project), function(){
          res.end('2');
          search.remove(req.params.id, function(){
            search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
            , req.params.id);
          });
        });
      } else {
        res.end('2');
      }  
    });
  } 
});

app.get('/accept/:pid/:uid', function(req, res){
  if(!req.isAuthenticated()){
    res.end('0');
  } else {
    client.get('hhba:projects:' + req.params.pid, function(err, project) {
      project = JSON.parse(project);
      if(project.owner_id != req.user.id) {
        res.end('1');
      } else if(project.pending.indexOf(req.params.uid) === -1) {
        res.end('2');
      } else {
        project.contributors.push(req.params.uid);
        project.pending.splice(project.pending.indexOf(req.params.uid), 1);
        client.set('hhba:projects:' + req.params.pid, JSON.stringify(project), function(){
          search.remove(req.params.pid, function(){
            search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
            , req.params.id);
          });
          res.end('3');
        });
      }  
    });
  } 
});

app.get('/decline/:pid/:uid', function(req, res){
  if(!req.isAuthenticated()){
    res.end('0');
  } else {
    client.get('hhba:projects:' + req.params.pid, function(err, project) {
      project = JSON.parse(project);
      if(project.owner_id != req.user.id) {
        res.end('0');
      } else if(project.pending.indexOf(req.params.uid) === -1) {
        res.end('1');
      } else {
        project.pending.splice(project.pending.indexOf(req.params.uid), 1);
        client.set('hhba:projects:' + req.params.pid, JSON.stringify(project), function(){
          res.end('1');
          search.remove(req.params.pid, function(){
            search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
            , req.params.id);
          });
        });
      }  
    });
  } 
});

app.get('/decline/:pid/:uid', function(req, res){
  if(!req.isAuthenticated()){
    res.end('0');
  } else {
    client.get('hhba:projects:' + req.params.id, function(err, project) {
      project = JSON.parse(project);
      if(project.owner_id != req.user.id) {
        res.end('0');
      } else if(project.pending.indexOf(req.user.username) === -1) {
        res.end('1');
      } else {
        project.pending.splice(project.pending.indexOf(req.user.username), 1);
        client.set('hhba:projects:' + req.params.id, JSON.stringify(project), function(){
          res.end('1');
        });
      }  
    });
  } 
});

app.post('/projects/new', isAuth, function(req, res){
  if(req.body.title && req.body.description){
    var hash = Math.floor(Math.random() * 9999999 + 1);
    console.log(req.body);
    var project = {
        id: hash
      , title: req.body.title
      , owner_id: req.user.id
      , owner_username: req.user.username
      , description: req.body.description
      , links: req.body.links.split(',') || []
      , contributors: [req.user.username]
      , pending: []
    };

    client.set('hhba:projects:' + hash, JSON.stringify(project), function(){
      search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
      , hash);
      res.redirect('/dashboard');
    });

  } else {
    res.redirect('/dashboard');
  }
});

app.get('/projects/edit/:id', isAuth, isOwner, function(req, res){
  client.get('hhba:projects:' + req.params.id, function(err, project){
    project = JSON.parse(project);
    res.render('edit', {project: project});
  });
});

app.post('/projects/edit/:id', isAuth, isOwner, function(req, res){
  if(req.body.title && req.body.description){
    client.get('hhba:projects:' + req.params.id, function(err, project){
      project = JSON.parse(project);

      project.title = req.body.title;
      project.description = req.body.description;
      project.links = req.body.links.split(',') || [];

      client.set('hhba:projects:' + req.params.id, JSON.stringify(project), function(){
        search.remove(req.params.id, function(){
          search.index(project.title + ' ' + project.description + ' ' + project.contributors.join(' ')
          , req.params.id);
        });
        res.redirect('/dashboard');
      });
    });
  } else {
    res.redirect('/dashboard');
  }
});

app.get('/projects/remove/:id', isAuth, isOwner, function(req, res){
  client.del('hhba:projects:' + req.params.id, function(err){
    res.redirect('/dashboard');
    search.remove(req.params.id);
  });
});

app.get('/search', isAuth, function(req, res){
  search
  .query(req.query.q)
  .end(function(err, ids){
    ids = ids.map(function(id){ return 'hhba:projects:' + id; });
    client.mget(ids, function(err, projects){
      projects = projects || [];
      projects = projects.map(function(project){
        return JSON.parse(project);
      });
      projects = projects.filter(function(project){
        return !!project;
      });
      res.render('dashboard', {projects: projects, user: req.user});
    });
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
