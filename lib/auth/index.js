
/**
 * This module is in charge of the authentication/authorization routes
 * We are using PassportJS for a really easy way to add custom authentication
 * services.
 *
 * The plan is to add username/password login in the future (or email-only)
 */

/*
 * Module dependencies
 */

import {Router} from 'express';
import passport from 'passport';
import passportHttp from 'passport-http';
import keys from 'keys.json';
import {User} from 'lib/models';
import gravatar from 'gravatar';

/**
 * Expose auth related router
 */

const app = Router();
export default app;

/**
 * Helpers for database user (de)serialization
 */

passport.serializeUser(({_id}, done) => done(null, _id));
passport.deserializeUser((_id, done) => User.findById(_id, done));


/**
 * Helper for saving user url intent so we redirect to that resource
 * on successful login
 */

const saveRedirect = ({session={}, query}, res, next) => {
  let redirect = query.redirect || '';
  redirect = redirect.charAt(0) === '/' ? redirect : `/${redirect}`;
  session.redirectUrl = redirect;
  next();
};

const redirectSubdomain = ({session}, res) => res.redirect(session.redirectUrl || '/');

const setPicture = (user, profile) => {
  if(profile.photos && profile.photos.length && profile.photos[0].value) {
    user.picture =  profile.photos[0].value.replace('_normal', '_bigger');
  }
  else if(profile.provider == 'facebook') {
    user.picture = "//graph.facebook.com/" + profile.id + "/picture";
    user.picture += "?width=73&height=73";
  }
  else if (profile.provider === "github"){
    user.picture = user.picture || profile._json.avatar_url;
  }
  else {
    user.picture = gravatar.url(user.email || '', {s: '73'});
  }

  user.picture = user.picture || '/default_avatar.png';
};


/**
 * Generate strategies for each provider
 */

const generateStrategy = provider => {
  // Require provider own module
  // TODO: Figure out how to use ES2015 syntax instead of requires
   const moduleName = provider === 'google' ? 'passport-google-oauth20' : `passport-${provider}`;
   const Strategy = require(moduleName).Strategy;

  // Generate routes
  const authenticateOptions = provider === 'google' ? { scope: ['profile'] } : {};
  app.get(`/auth/${provider}`, saveRedirect, passport.authenticate(provider, authenticateOptions));
  app.get(`/auth/${provider}/callback`, passport.authenticate(provider, { failureRedirect: '/' }), redirectSubdomain);

  const strategyOptions = Object.assign({}, keys[provider]);
  delete strategyOptions.name;
  delete strategyOptions.icon;
  passport.use(new Strategy(strategyOptions, async (token, tokenSecret, profile, done) => {
    let user = await User.findOne({provider_id: profile.id, provider: provider}).exec();
    if(!user) {
      user = new User();
      user.provider = provider;
      user.provider_id = profile.id;

      if(profile.emails && profile.emails.length && profile.emails[0].value)
        user.email = profile.emails[0].value;

      setPicture(user, profile);

      user.name = profile.displayName || profile.username;
      user.username = profile.username || profile.displayName;

      try {
        done(null, await user.save());
      } catch(err) {
        done(err, null);
      }
    } else {
      //Update user picture provider if url changed
      var picBefore = user.picture;
      setPicture(user, profile);
      if (user.picture !== picBefore){
        try {
          done(null, await user.save());
        } catch(err) {
          done(err, null);
        }
      } else {
        done(null, user);
      }
    }
  }));
}

Object.keys(keys).forEach(generateStrategy);
