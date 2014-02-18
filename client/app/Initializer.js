
module.exports = function(){

  // Init Handlebars Helpers
  require('./helpers/handlebars');

  window.hackdash = window.hackdash || {};

  window.hackdash.getQueryVariable = function(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] === variable){return decodeURI(pair[1]);}
    }
    return(false);
  };

  //require('./helpers/backboneOverrides');
  //require('./helpers/jQueryOverrides');
  
  window.hackdash.apiURL = "/api/v2";

  window.hackdash.app = require('./App');
  window.hackdash.app.start();
};
