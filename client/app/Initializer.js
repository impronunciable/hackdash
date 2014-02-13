
//var settings = require('./settings')();

module.exports = function(){

  // Init Handlebars Helpers
  require('./helpers/handlebars');

  window.hackdash = window.hackdash || {}; //settings;

  //require('./helpers/backboneOverrides');
  //require('./helpers/jQueryOverrides');
  
  window.hackdash.baseURL = "local.host:3000";
  window.hackdash.apiURL = "/api/v2";

  window.hackdash.app = require('./App');
  window.hackdash.app.start();
};
