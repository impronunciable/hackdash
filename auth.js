
/*
 * Module dependencies
 */

var passport = require('passport')
  , keys = require('./keys.json')
  , mongoose = require('mongoose');

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

app.set('providers', Object.keys(keys));

for(var strategy in keys) {

  (function(provider){

    app.get('/auth/' + provider, passport.authenticate(provider));
    app.get('/auth/' + provider + '/callback', passport.authenticate(provider, { failureRedirect: '/' }), function(req, res){ res.redirect('/'); });

    var Strategy = require('passport-' + provider).Strategy;
    passport.use(new Strategy(keys[provider],
    function(token, tokenSecret, profile, done) {
      User.findOne({provider_id: profile.id, provider: provider}, function(err, user){
        if(!user) {
          var user = new User();
          user.provider = provider;
          user.provider_id = profile.id;
          user.email = profile.emails && profile.emails.length && profiles.emails[0].value;
          user.name = profile.displayName;
          user.username = profile.username || profile.displayName;
          user.save(function(err, user){
            done(null, user);
          });
        } else {
          done(null, user);
        }
      });
    }));

  })(strategy);

}

// Anonymous auth for test porpouses 

if(process.env.NODE_ENV == "test") {

  var BasicStrategy = require('passport-http').BasicStrategy;

  var u;
  var user = new User({provider: 'basic', provider_id: 1, username: 'test'});
  user.save(function(err, usr){ u = usr; });

  passport.use(new BasicStrategy({}, function(username, password, done) {
    process.nextTick(function () {
      return done(null, u);
    });
  }));

  app.all('*', passport.authenticate('basic'));

}

};


