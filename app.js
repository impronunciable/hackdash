
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , http = require('http');

/*
 * DB
 */

var redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , client = exports.client = redis.createClient();

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
  app.use(express.cookieParser('iegn23ipgnv'));
  app.use(express.session({secret: 'ief12ne21r', store: new RedisStore }));
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
