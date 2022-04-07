
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
import logger from 'debug';

import config from 'config';
import models from 'lib/models';
import mailer from 'lib/mailer';
import auth from 'lib/auth';
import routes from 'lib/routes';
import seo from 'seo';


const debug = logger('hackdash:server');

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
console.log(config.host);
const hostDots = config.host.match(/\./g);
const subdomainOffset = (hostDots ? hostDots.length : 0) + 1;
app.set('subdomain offset',  subdomainOffset);
console.log(`SUBDOMAIN OFFSET ${subdomainOffset}`);

const cookie = { maxAge: sessionMaxAge, path: '/' };
// https://stackoverflow.com/a/1188145
if (subdomainOffset > 1)
    cookie["domain"] = '.' + config.host;

app.use(session({
  secret: config.session,
  store: new MongoStore({db: config.db.name, url: config.db.url}),
  cookie: cookie,
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
 * Handle uncaught exceptions on production
 * TODO: Improve the logging
 */

if(process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', err => console.log(err));
}

export default app;
