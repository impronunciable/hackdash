
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , http = require('http');

/*
 * DB
 */

mongoose.connect('mongodb://localhost/hackdash');

var app = exports.app = express();

/*
 * Application config
 */

app.configure(function(){
  app.set('config', require('./config.json'));
  app.set('port', process.env.PORT || app.get('config').port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('config').session));
  app.use(express.session({
      secret: app.get('config').session
    , store: new MongoStore({db: app.get('config').db}) 
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set('statuses',['brainstorming','wireframing','building','reasearching','prototyping','releasing']);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./models')(app);

/*
 * Auth
 */

require('./auth')(app);

/*
 * Routes
 */

require('./routes')(app);

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log(err);
});
