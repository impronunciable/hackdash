
var template = require('./templates/dashboard.hbs');
var JSONP = require('./JSONP');

var Handlebars = require('hbsfy/runtime');

var urls = {
  dashboards: 'dashboards/',
  projects: 'projects/',
  users: 'users/',
};

Handlebars.registerHelper('getUserUrl', function(_id) {
  return getBaseURL() + urls.users + _id;
});

Handlebars.registerHelper('getProjectUrl', function(_id) {
  return getBaseURL() + urls.projects + _id;
});

var Dashboard = module.exports = function(options){
  var opts = options || {};
  
  this.container = opts.container;
  this.name = opts.name;

  this.show = opts.show;
};

Dashboard.prototype.fetch = function(done){
  var baseURL = getBaseURL();
  var apiURI = window.hackdashEmbed.config.apiURI;
  JSONP.fetch(baseURL + apiURI + urls.dashboards + this.name, done);
};

Dashboard.prototype.render = function(data){
  data = data || {};
  data.projects = data.projects || [];

  data.show = this.show;

  var baseURL = getBaseURL();
  data.urls = {
    dashboards: baseURL + urls.dashboards,
    projects: baseURL + urls.projects,
    users: baseURL + urls.users
  };

  this.container.innerHTML = template(data);
};

function getBaseURL(){
  var 
    config = window.hackdashEmbed.config,
    uri = config.baseURI,
    uriSSL = config.baseURISSL,
    useSSL = location.protocol === 'https:' && uriSSL;

  return ( useSSL ? uriSSL : uri );
}