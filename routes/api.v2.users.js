/*
 * RESTfull API: Dashboard Resources
 * 
 * 
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , _ = require('underscore')
  , config = require('../config.json');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

module.exports = function(app, uri, common) {

  app.get(uri + '/admins', getInstanceAdmins, sendUsers);
  app.get(uri + '/users/:uid', getUser, sendUser);

  app.get(uri + '/profiles/:uid', getUser, setProjects, setContributions, setLikes, sendUser);

};

var getInstanceAdmins = function(req, res, next){
  var domain = req.subdomains[0];

  User
    .find({ "admin_in": domain })
    .exec(function(err, users) {
      if(err) return res.send(500);
      req.users = users || [];
      next();
    });
};

var getUser = function(req, res, next){
  User
    .findById(req.params.uid, function(err, user){
      if(err) return res.send(500);
      req.user_profile = user.toObject();
      next();
    });
};

var setProjects = function(req, res, next){

  Project
    .find({ "leader": req.user_profile._id }, function(err, projects) {
      if(err) return res.send(500);
      req.user_profile.projects = projects || [];
      next();
    });
};

var setContributions = function(req, res, next){
  var uid = req.user_profile._id;

  Project
    .find({ "leader": { $ne: uid } , "contributors": uid }, function(err, projects) {
      if(err) return res.send(500);
      req.user_profile.contributions = projects || [];
      next();
    });

};

var setLikes = function(req, res, next){
  var uid = req.user_profile._id;

  Project
    .find({ "leader": { $ne: uid }, "followers": uid }, function(err, projects) {
      if(err) return res.send(500);
      req.user_profile.likes = projects || [];
      next();
    });
    
};

var sendUser = function(req, res){
  res.send(req.user_profile);
};

var sendUsers = function(req, res){
  res.send(req.users);
};
