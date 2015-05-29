
/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http');
var path = require('path');
var clientVersion = require('./client/package.json').version;
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = exports.app = express();

var sessionMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days;
var staticsMaxAge = 365 * 24 * 60 * 60 * 1000; // 1 Year;

var config;

// Set Config
switch(app.get('env')) {
  case "development":
  case "production":
    config = require('./config.json');
    break;
  case "test":
    config = require('./config.test.json');
    break;
}

/*
 * DB
 */

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

/*
 * Application config
 */

app.set('config', config);
app.set('clientVersion', clientVersion);
app.set('port', process.env.PORT || app.get('config').port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('combined'));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var prCfg = app.get('config').prerender;
if (prCfg && prCfg.enabled){
  app.use(require('./seo')(app));
}

app.use(session({
  secret: app.get('config').session,
  store: new MongoStore({db: app.get('config').db.name, url: app.get('config').db.url}),
  cookie: { maxAge: sessionMaxAge, path: '/', domain: '.' + app.get('config').host },
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public', { maxAge: staticsMaxAge }));

app.set('statuses', require('./models/statuses'));

app.locals.title = config.title;

/*
 * Models
 */

require('./models')();

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

app.use(function(req, res) {
  res.status(404);
  res.render('404');
});

app.use(function(error, req, res, next) {
  console.log(error);
  res.status(500);
  res.render('500');
});


server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log(err);
});
