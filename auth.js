
/*
 * Module dependencies
 */

var passport = require('passport')
  , keys = require('./keys.json')
  , mongoose = require('mongoose')


var User = mongoose.model('User');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    done(err, user);
  });
});

for(var strategy in keys) {

  (function(provider){

    var Strategy = require('passport-' + provider).Strategy;

    passport.use(new Strategy({
      consumerKey: keys[provider].consumerKey,
      consumerSecret: keys[provider].consumerSecret,
      callbackURL: keys[provider].callbackURL
    },
  function(token, tokenSecret, profile, done) {
    User.findOne({provider_id: profile.id, provider: provider}, function(err, user){
      if(!user) {
        var user = new User();
        user.provider = provider;
        user.provider_id = profile.id;
        user.username = profile.username;
        user.save(function(err, user){
          done(null, user);
        });
      } else {
        done(null, user);
      }
    });
  }));

  })(keys[strategy]);

}

