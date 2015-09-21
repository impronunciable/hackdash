
/**
 * Main HTTP server
 * -  Create the http server configuring the base middlewares
 * -  Mount the models module in charge of the database management
 */

/**
 * Module dependencies.
 */

import express from 'express';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import http from 'http';
import {join} from 'path';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import {json, urlencoded} from 'body-parser';
import methodOverride from 'method-override';
import less from 'less-middleware';

import config from 'config';
import models from 'lib/models';
import mailer from 'lib/mailer';
import auth from 'lib/auth';
import routes from 'lib/routes';
import seo from 'seo';
import live from 'lib/live';

/**
 * Module scope constants
 */

const sessionMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const staticsMaxAge = 365 * 24 * 60 * 60 * 1000; // 1 Year in ms

/**
 * Create the main express app
 */

const app = express();

/**
 * Express app settings, mostly from the config file
 */

app.set('port', process.env.PORT || config.port || 3000);
app.set('views', __dirname + '/../../views');
app.set('view engine', 'jade');

/**
 * App base middlewares
 */

app.use(less(join(__dirname, '/../../public')));
app.use(favicon(__dirname + '/../../public/favicon.ico'));
app.use(morgan('combined'));
app.use(compression());
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(methodOverride());

if (config.prerender && config.prerender.enabled) {
  app.use(seo(app));
}

/**
 * User session management via mongodb and express session
 */

const MongoStore = connectMongo(session);
app.use(session({
  secret: config.session,
  store: new MongoStore({db: config.db.name, url: config.db.url}),
  cookie: { maxAge: sessionMaxAge, path: '/', domain: '.' + config.host },
  resave: false,
  saveUninitialized: false
}));

/**
 * PassportJS initialization
 */

app.use(passport.initialize());
app.use(passport.session());

/**
 * Static files handling
 */

app.use(express.static(__dirname + '/../../public', { maxAge: staticsMaxAge }));

/**
 * Global title for all templates
 */

app.locals.title = config.title;

/*
 * Authentication related routes
 */

app.use('/', auth);

/*
 * Route handlers. Each `section` of the hackdash provide their own router
 * The main app is in charge only of mounting the routers.
 */

app.use('/', routes);

/**
 * Create the main HTTP server. Hackdash exposes it in case another app
 * want to mount it or use it for other purposes
 */ 

const server = http.Server(app)
export default server;

/*
 * Live dashboard. It uses socketIO to provide cool `realtime` features
 * it's an opt-in from the config file.
 */

if(config.live) {
	live(app, server);
}

/**
 * Error handling
 */

app.use((req, res) => {
  res.status(404);
  res.render('404');
});

app.use((error, req, res, next) => {
  // TODO: Improve logging (use syslog)
  console.log('error', error);
  res.status(500);
  res.render('500');
});

/**
 * Start the HTTP server at the previously defined port
 */

server.listen(app.get('port'), () => console.log("Express server listening on port " + app.get('port')));

/**
 * Handle uncaught exceptions on production
 * TODO: Improve the logging
 */

if(process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', err => console.log(err));
}
