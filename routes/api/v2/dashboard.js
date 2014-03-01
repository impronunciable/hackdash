/*
 * RESTfull API: Dashboard Resources
 * 
 * 
 */


var passport = require('passport')
  , mongoose = require('mongoose')
  , _ = require('underscore')
  , config = require('../../../config.json');

var Project = mongoose.model('Project')
  , Dashboard = mongoose.model('Dashboard');

module.exports = function(app, uri, common) {

  app.get(uri + '/dashboards', setQuery, setDashboards, sendDashboards);

  app.get(uri + '/', getDashboard, sendDashboard);
  app.put(uri + '/', common.isAuth, getDashboard, isAdminDashboard, updateDashboard, sendDashboard);

  app.post(uri + '/', common.notAllowed);
  app.del(uri + '/', common.notAllowed);

  app.get(uri + '/csv', common.isAuth, getDashboard, isAdminDashboard, sendDashboardCSV);

};

var setQuery = function(req, res, next){
  var query = req.query.q || "";

  req.search_query = {};

  if (query.length === 0){
    return next();
  }

  var regex = new RegExp(query, 'i');
  req.search_query.$or = [ { domain: regex }, { title: regex }, { description: regex } ];

  next();
};

var setDashboards = function(req, res, next){
  Dashboard.find(req.search_query || {})
    .limit(30)
    .sort( { "created_at" : -1 } )
    .exec(function(err, dashboards) {
      if(err) return res.send(500);
      req.dashboards = dashboards || [];
      next();
    });
}

var getDashboard = function(req, res, next){
  if (req.subdomains.length > 0) {
    Dashboard.findOne({ domain: req.subdomains[0] })
      .exec(function(err, dashboard) {
        if(err) return res.send(500);
        if(!dashboard) return res.send(404);
        req.dashboard = dashboard;
        next();
      });
  }
  else {
    res.send(400, "Expected to be called at a subdomain");
  } 
}

var isAdminDashboard = function(req, res, next){
  var isAdmin = (req.user.admin_in.indexOf(req.dashboard.domain) >= 0);

  if (!isAdmin) {
    return res.send(403, "Only Administrators are allowed for this action.");
  }

  next();
};

var updateDashboard = function(req, res, next) {
  var dashboard = req.dashboard;

  if(req.body.link && req.body.link.indexOf('http') != 0) {
    req.body.link = 'http://' + req.body.link;
  }

  function getValue(prop){
    return req.body.hasOwnProperty(prop) ? req.body[prop] : dashboard[prop];    
  }

  dashboard.title = getValue("title");
  dashboard.description = getValue("description");
  dashboard.link = getValue("link");
  dashboard.open = getValue("open");
  
  dashboard.save(function(err, dashboard){
    if(err) return res.send(500);
    req.dashboard = dashboard;
    next();
  });
};

var sendDashboard = function(req, res){
  res.send(req.dashboard);
};

var sendDashboards = function(req, res){
  res.send(req.dashboards);
};

var sendDashboardCSV = function(req, res){
  var domain = req.subdomains[0];

  function CSVEscape(field) {
    return String(field || "").replace(/\"/g, '""').replace(/,/g, '');
  }
  
  var headers = [
      'name'
    , 'username'
    , 'provider'
    , 'e-mail'
    , 'engagement'
    , 'project'
    , 'status'
    , 'dashboard'
  ].map(CSVEscape).join(',');
 
  function projectToCSV(project) {

    var people = [];

    function addPerson(engagement, user){
      people.push([
          user.name
        , user.username
        , user.provider
        , user.email
        , engagement
        , project.title
        , project.status
        , domain
      ]);
    }

    _.each(project.contributors, addPerson.bind(null, "contributor"));
    _.each(project.followers, addPerson.bind(null, "follower"));

    // sort people by name ASC
    people.sort(function(a, b) { return a[0] - b[0]; });

    return (_.map(people, function(person){
      return person.map(CSVEscape).join(',') + '\n';
    })).join("");
  }
 
  var started = false;
  function start(response) {
    response.setHeader('Content-disposition', 'attachment; filename=' + domain + '.csv');
    response.contentType('csv');
    response.write(headers + '\n');
    started = true;
  }
 
  Project.find({ domain: domain })
    .populate('contributors')
    .populate('followers')
    .sort('title')
    .stream()
    .on('data', function (project) {
      if (!started) { start(res); }
      res.write(projectToCSV(project));
    })
    .on('close', function () {
      res.end();
    })
    .on('error', function (err) {
      res.send(500, {err: err, msg: "Failed to get projects"});
    });

};