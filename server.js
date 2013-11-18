
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , config = require('./config.json')
  , http = require('http');

/*
 * DB
 */

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

var app = exports.app = express();

/*
 * Application config
 */

app.configure(function(){
  app.set('config', config);
  app.set('port', process.env.PORT || app.get('config').port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.limit('3.5mb'));
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('config').session));
  app.use(express.session({
      secret: app.get('config').session
    , store: new MongoStore({db: app.get('config').db.name, url:
app.get('config').db.url}) 
    , cookie: { maxAge: 365 * 24 * 60 * 60 * 1000, path: '/', domain: app.get('config').domain }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(function(req, res) {
     res.status(400);
     res.render('404');
  });
  app.use(function(error, req, res, next) {
    console.log(error);
     res.status(500);
     res.render('500');
  });
  app.set('statuses',['brainstorming','wireframing','building','researching','prototyping','releasing']);
	app.locals.title = config.title;
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Models
 */

require('./models')(app);

/*
 * Auth
 */

require('./auth')(app);

/*
 * Routes
 */

require('./routes')(app);

/*
 * Mailer
 */

if(app.get('config').mailer) {
	require('./mailer')(app);
}

var server = module.exports = http.Server(app);

/*
 * Live dashboard
 */

if(config.live) {
	require('./live')(app, server);
}

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log(err);
});
