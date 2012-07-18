
/*
 * Module dependencies
 */

var passport = require('passport')
  , keys = require('./keys.json')
  , TwitterStrategy = require('passport-twitter').Strategy;

var client = module.parent.exports.client;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  client.get('users:'+id, function(err, user){
    done(err, JSON.parse(user));
  });
});

passport.use(new TwitterStrategy({
    consumerKey: keys.consumer_key,
    consumerSecret: keys.consumer_secret,
    callbackURL: keys.twitter_callback
  },
  function(token, tokenSecret, profile, done) {
    client.set('users:' + profile.id, JSON.stringify(profile), function(){
      return done(null, profile);
    });
  }
));

