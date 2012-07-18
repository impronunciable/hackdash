
/*
 * Module dependencies
 */

var passport = require('passport')
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
    consumerKey: "jurDRnWS9xaRPErUttVxPQ",
    consumerSecret: "bEztrG7ir0F1Q2oZNcH0n2bfzBG36mpiDJWhEVBtA3A",
    callbackURL: "http://local.host:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    client.set('users:' + profile.id, JSON.stringify(profile), function(){
      return done(null, profile);
    });
  }
));

