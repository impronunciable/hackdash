
/**
 * Router helpers are functions (in general middlewares) common to many routes
 */

/**
 * Module dependencies
 */

import providers from 'keys.json';

/*
 * Render templates
 */

export const render = path => (req, res) => res.render(path);

/*
 * Redirect to given route
 */

export const redirect = path => (req, res) => res.redirect(path);

/*
 * Check if current user is authenticated
 */

export const isAuth = (req, res, next) => req.isAuthenticated() ? next() : res.send(403);

/*
 * Add current user template variable
 */

export const loadUser = (req, res, next) => {
  res.locals.user = req.user;
  next();
};

/*
 * Makes vars available to views
 */

export const setViewVar = (key, value) => ((req, res, next) => {
  res.locals[key] = value;
  next();
});

/*
 * Load app providers
 */

export const loadProviders = (req, res, next) => {
  res.locals.providers = Object.entries(providers).map(([key, options]) => ({
    key: key,
    name: options.name || key.charAt(0).toUpperCase() + key.slice(1),
    icon: `fa-${options.icon || key}`,
  }));
  next();
};
