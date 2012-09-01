
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , keys = require('./keys.json')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , http = require('http');

/*
 * DB
 */

mongoose.connect('mongodb://localhost/hackdash');

require('./models');

/*
 * Auth
 */

require('./auth');

/*
 * Application config
 */

var app = exports.app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(keys.session));
  app.use(express.session({secret: keys.session, store: new MongoStore({db: 'hackdash'}) }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes');

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log(err);
});
