
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

if(keys.twitter) {
  var TwitterStrategy = require('passport-twitter').Strategy;

  passport.use(new TwitterStrategy({
    consumerKey: keys.twitter.consumer_key,
    consumerSecret: keys.twitter.consumer_secret,
    callbackURL: keys.twitter.twitter_callback
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
  }));
}
