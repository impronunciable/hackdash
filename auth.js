
/*
 * Module dependencies
 */

var passport = require('passport')
  , keys = require('./keys.json')
  , mongoose = require('mongoose')
  , gravatar = require('gravatar');

var User = mongoose.model('User');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    done(err, user);
  });
});

module.exports = function(app) {

  // Helpers

  var saveRedirect = function(req, res, next) {
    req.session = req.session || {};

    var redirect = ((req.query && req.query.redirect) || '');
    redirect = (redirect.charAt(0) === '/' ? redirect : '/' + redirect);
    req.session.redirectUrl = redirect;

    next();
  };

  var redirectSubdomain = function(req, res) {
    res.redirect(req.session.redirectUrl || '/');
  };

  app.set('providers', Object.keys(keys));

  for(var strategy in keys) {

    (function(provider){

      app.get('/auth/' + provider, saveRedirect, passport.authenticate(provider));
      app.get('/auth/' + provider + '/callback',
        passport.authenticate(provider, { failureRedirect: '/' }), redirectSubdomain);

      var Strategy = require('passport-' + provider).Strategy;

      passport.use(new Strategy(keys[provider], function(token, tokenSecret, profile, done) {

        User.findOne({provider_id: profile.id, provider: provider}, function(err, user){

          function setPicture(){

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
          }

          if(!user) {

            var user = new User();
            user.provider = provider;
            user.provider_id = profile.id;

            if(profile.emails && profile.emails.length && profile.emails[0].value)
              user.email = profile.emails[0].value;

            setPicture();

            user.name = profile.displayName || profile.username;
            user.username = profile.username || profile.displayName;

            user.save(function(err, user){
              if (err) console.dir(err);
              done(null, user);
            });

            return;
          }

          //Update user picture provider if url changed
          var picBefore = user.picture;
          setPicture();

          if (user.picture !== picBefore){
            user.save(function(err, user){
              done(null, user);
            });

            return;
          }

          done(null, user);

        });

      }));

    })(strategy);

  }

  // Anonymous auth for test porpouses
  if(process.env.NODE_ENV == "test") {

    var BasicStrategy = require('passport-http').BasicStrategy;

    passport.use(new BasicStrategy({}, function(username, password, done) {

      User.findOne({ username: username }, function(err, usr){
        return done(null, usr);
      });

    }));

    app.all('*', passport.authenticate('basic'));
  }

};
