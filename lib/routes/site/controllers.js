
/**
 * Site router controllers
 */

/**
 * Module dependencies
 */

import {version as clientVersion} from 'client/package.json';
import {Dashboard, } from 'lib/models';
import statuses from 'lib/models/statuses';
import {check} from 'lib/utils/metas';
import {setViewVar, loadProviders, render} from 'lib/routes/helpers';
import {port, host, live, discourseUrl, disqus_shortname, googleAnalytics, facebookAppId} from 'config';
import keys from 'keys.json';

/**
 * Module scope constants
 */

const appHost = `${host}${port !== 80 ? `:${port || 3000}` : ''}`;

/**
 * If user has no email, redirect to their profile
 */

const checkProfile = ({user, session={}}, res, next) => {
  if (user && !user.email){
    const q = session.redirectUrl ? `?from=${session.redirectUrl}` : '';
    res.redirect(`/users/profile${q}`);
  }
  next();
};

/*
 * Add current user template variable
 */

const loadUser = ({user}, res, next) => {
  res.locals.errors = [];
  res.locals.user = user;
  next();
};

/*
 * Log out current user
 */

export const logout = (req, res, next) => {
  req.logout();
  next();
};

/**
 * Check subdomain
 * TODO: Put a real function name
 */

const hasSubDomain_GoDashboard = ({subdomains, socket}, res, next) => {
  if (subdomains.length) {
    const protocol = socket.encrypted ? 'https' : 'http';
    return res.redirect(`${protocol}://${host}/dashboards/${subdomains[0]}`);
  }
  next();
};

/**
 * Check remove subdomain
 * TODO: Put a real function name
 */

const hasSubDomain_RemoveIt = ({subdomains, socket}, res, next) => {
  if (subdomains.length) {
    const protocol = socket.encrypted ? 'https' : 'http';
    return res.redirect(`${protocol}://${host}${req.originalUrl}`);
  }
  next();
};

export const projectFormRedirect = ({subdomains, socket}, res) => {
  const protocol = socket.encrypted ? 'https' : 'http';
  if (subdomains.length) {
    const baseUrl = `${protocol}://${host}/dashboards/${subdomains[0]}`;
    return res.redirect(`${baseUrl}/create`);
  }
  return res.redirect(`${protocol}://${host}`);
};

export const userStack = [loadUser, loadProviders];
export const viewsStack = [
  setViewVar('host', appHost),
  setViewVar('version', clientVersion),
  setViewVar('statuses', statuses),
  setViewVar('discourseUrl', discourseUrl),
  setViewVar('disqus_shortname', disqus_shortname),
  setViewVar('googleAnalytics', googleAnalytics || null),
  setViewVar('fbAppId', (keys.facebook && keys.facebook.clientID) || facebookAppId || null),
  check()
];

export const homeStack = []
  .concat([hasSubDomain_GoDashboard])
  .concat(userStack)
  .concat([checkProfile])
  .concat(viewsStack)
  .concat([render('landing')]);

export const appStack = []
  .concat([hasSubDomain_RemoveIt])
  .concat(userStack)
  .concat([checkProfile])
  .concat(viewsStack)
  .concat([render('app')]);

export const profileStack = []
  .concat([hasSubDomain_RemoveIt])
  .concat(userStack)
  .concat(viewsStack)
  .concat([render('app')]);

export const embedStack = []
  .concat([hasSubDomain_RemoveIt])
  .concat(viewsStack)
  .concat([render('embed')]);
