
var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../metrics/config')
  , fs = require('fs');

module.exports = function(app) {
  app.get('/metrics', isValid, setMetrics, render('metrics'));
};

/*
 * Render templates
 */
var render = function(path) {
  return function(req, res) {
    res.render(path);
  };
};

/*
 * Check link is valid
 */

var isValid = function(req, res, next){
  var code = req.query && req.query.q || "";
  if (code === config.code){
    return next();
  }

  res.send(400);
};

/*
 * Set Metrics JSON
 */

var setMetrics = function(req, res, next){

  fs.readFile('metrics/' + config.filename, function(err, metrics){
    if (err) { 
      console.log(err); 
      res.send(500, 'Error on retrieving metrics');
      return;
    }

    res.locals.metrics = JSON.parse(metrics);
    next();
  });
};