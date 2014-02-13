
/*
 * RESTfull API
 * 
 * 
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../config.json');

var User = mongoose.model('User')
  , Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

var apiVersion = "v2";

module.exports = function(app) {

  var uri = '/api/' + apiVersion;

  app.get(uri + '/projects', setQuery, setProjects, sendProjects);
  //app.get(uri + '/projects/search', setQuery, setProjects, sendProjects);

};

var setQuery = function(req, res, next){
  var query = req.query.q || "";

  if (query.length === 0){
    //res.send(400, "expected 'q' parameter"); //Bad Request
    return next();
  }

  var regex = new RegExp(query, 'i');
  
  req.query = {
    $or: [ { title: regex }, { description: regex } ]
  };

  next();
};

var setProjects = function(req, res, next){
  Project.find(req.query || {})
    .limit(50)
    .exec(function(err, projects) {
      if(err) return res.send(500);
      res.projects = projects;
      next();
    });
}

var sendProjects = function(req, res){
  res.send(res.projects);
};
