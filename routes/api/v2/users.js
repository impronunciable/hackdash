/*
 * RESTfull API: Dashboard Resources
 *
 *
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , _ = require('underscore')
  , config = require('../../../config.json');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Collection = mongoose.model('Collection');

var teamIds = [];
var maxLimit = 30;

module.exports = function(app, uri, common) {
  teamIds = app.get('config').team || [];

  app.get(uri + '/:domain/admins', getInstanceAdmins, sendUsers);
  app.post(uri + '/:domain/admins/:uid', common.isAuth, isDashboardAdmin, getUser, addAdmin, sendUser);

  app.get(uri + '/users', setQuery, getUsers, sendUsers);

  app.get(uri + '/users/team', getTeam, sendUsers);
  app.get(uri + '/users/:uid', getUser, sendUser);

  app.get(uri + '/profiles/:uid', getUser, setCollections, setProjects, setContributions, setLikes, sendUser);
  app.put(uri + '/profiles/:uid', common.isAuth, getUser, canUpdate, updateUser);

};

var getInstanceAdmins = function(req, res, next){
  var domain = req.params.domain;

  User
    .find({ "admin_in": domain })
    .exec(function(err, users) {
      if(err) return res.send(500);
      req.users = users || [];
      next();
    });
};

var isDashboardAdmin = function(req, res, next){
  var domain = req.params.domain;

  var isAdmin = (req.user.admin_in.indexOf(domain) >= 0);

  if (!isAdmin) {
    return res.send(403, "Only Administrators are allowed for this action.");
  }

  next();
};

var setQuery = function(req, res, next){
  var query = req.query.q || "";

  req.limit = req.query.limit || maxLimit;

  if (req.limit > maxLimit){
    req.limit = maxLimit;
  }

  req.search_query = {};

  if (query.length === 0){
    return next();
  }

  var regex = new RegExp(query, 'i');
  req.search_query.$or = [ { name: regex }, { username: regex } ];

  next();
};

var getUser = function(req, res, next){
  User
    .findById(req.params.uid, function(err, user){
      if(err) return res.send(500);
      if(!user) return res.send(404);
      req.user_profile = user.toObject();
      next();
    });
};

var getUsers = function(req, res, next){
  User
    .find(req.search_query || {})
    .limit(req.limit || maxLimit)
    .sort("name username")
    .exec(function(err, users) {
      if(err) return res.send(500);
      req.users = users;
      next();
    });
};

var canUpdate = function(req, res, next){
  var isLogedInUser = req.user.id === req.params.uid;

  if (!isLogedInUser) {
    return res.send(403, "Only your own profile can be updated.");
  }

  next();
};

var addAdmin = function(req, res, next){
  var domain = req.params.domain;

  User.update({_id: req.user_profile._id }, { $addToSet : { 'admin_in': domain }}, function(err){
    if(err) return res.send(500);
    next();
  });

};

var updateUser = function(req, res){
  var user = req.user;

  //add trim

  if (!req.body.name){
    return res.send(500, { error: "name_required" });
  }

  if (!req.body.email){
    return res.send(500, { error: "email_required" });
  }

  user.name = req.body.name;
  user.email = req.body.email;
  user.bio = req.body.bio;

  user.save(function(err, user){
    if(err) {
      if (err.errors.hasOwnProperty('email')){
        return res.send(500, { error: "email_invalid" });
      }

      return res.send(500);
    }

    res.send(200);
  });
};

var setCollections = function(req, res, next){

  Collection
    .find({ "owner": req.user_profile._id }, function(err, collections) {
      if(err) return res.send(500);
      req.user_profile.collections = collections || [];
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

var getTeam = function(req, res, next){
  req.users = [];

  if (teamIds.length > 0){

    User
      .find({ _id: { $in: teamIds } })
      .select("_id name picture bio provider username")
      .exec(function(err, users) {
        if(err)
          return res.send(500, "could not retrieve team users");

        req.users = [];

        users.forEach(function(user){
          var idx = teamIds.indexOf(user._id.toString());
          req.users[idx] = user;
        });

        next();
      });

    return;
  }

  next();
};

var sendUser = function(req, res){
  res.send(req.user_profile);
};

var sendUsers = function(req, res){
  res.send(req.users);
};
