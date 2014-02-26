
/*
 * RESTfull API
 * 
 * 
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../config.json');

module.exports = function(app) {

  var root = '/api/';

  require('./api.v2.dashboard')(app, root + 'v2', common);
  require('./api.v2.projects')(app, root + 'v2', common);
  require('./api.v2.users')(app, root + 'v2', common);

};

var common = {
  
  notAllowed: function(req, res){
    res.send(405); //Not Allowd
  },

  isAuth: function(req, res, next){
    if (!req.isAuthenticated()){
      return res.send(401, "User not authenticated");
    }

    next();
  }

};
