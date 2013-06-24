
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

var initStrategies = function(app) {

  app.set('providers', Object.keys(keys));

  for(var provider in keys) {
    initStrategy(app, keys, provider);
  }
};

var initStrategy = function(app, keys, provider) {
  app.get('/auth/' + provider, passport.authenticate(provider));
  app.get('/auth/' + provider + '/callback',
    passport.authenticate(provider, { failureRedirect: '/' }), 
    function(req, res){ res.redirect('/'); });

  var Strategy = require('passport-' + provider).Strategy;
  passport.use(new Strategy(keys[provider], findOrCreateUser(provider)));
};

var findOrCreateUser = function (provider) {
  return function(token, tokenSecret, profile, done) {
    if(provider === "persona") profile = {id: token, emails: [token]};
    User.findOne({provider_id: profile.id, provider: provider}, 
      function(err, user){
        if(err) return res.send(500);
        if(!user) {
          createUser(provider, profile, done);
        } else {  
          done(null, user);
        }
      });
  };
};

var createUser = function(provider, profile, done) {
  var user = new User();
  user.provider = provider;
  user.provider_id = profile.id;

  if(profile.emails && profile.emails.length && profile.emails[0].value)
    user.email = profile.emails[0].value;
    
  user.picture = getProfilePicture(profile, user.email);
  user.name = profile.displayName;
  user.username = profile.username || profile.displayName;
  user.save(done);
};

var getProfilePicture = function(profile, email) {
  var picture = '/images/default_avatar.png';
  if(profile.photos && profile.photos.length && profile.photos[0].value) {
    picture =  profile.photos[0].value.replace('_normal', '_bigger');
  } else if(profile.provider == 'facebook') {
    picture = "https://graph.facebook.com/" + profile.id + "/picture";
    picture += "?width=73&height=73";
  } else {
    picture = gravatar.url(email || '', {s: '73'});
  }
  
  return picture;
};


module.exports = initStrategies;
