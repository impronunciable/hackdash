
/*
 * Module dependencies
 */

var passport = require('passport')
  , twitter_keys = require('./twitter-keys.json')
  , mongoose = require('mongoose')
  , TwitterStrategy = require('passport-twitter').Strategy;

var User = mongoose.model('User');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    done(err, user);
  });
});

passport.use(new TwitterStrategy({
    consumerKey: twitter_keys.consumer_key,
    consumerSecret: twitter_keys.consumer_secret,
    callbackURL: twitter_keys.twitter_callback
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({provider_id: profile.id, provider: 'twitter'}, function(err, user){
      if(!user) {
        var user = new User();
        user.provider = 'twitter';
        user.provider_id = profile.id;
        user.username = profile.username;
        user.save(function(err, user){
          done(null, user);
        });
      } else {
        done(null, user);
      }
    });
  }
));

