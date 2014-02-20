/**
 * Landing Application
 *
 */

var 
    Header = require("./views/Header")
  , Dashboard = require("./models/Dashboard")
  , Projects = require("./models/Projects")
  , ProjectsView = require("./views/Projects");

module.exports = function(type){

  var app = module.exports = new Backbone.Marionette.Application();

  app.addRegions({
    header: "header",
    main: "#main"
  });

  function initISearch() {
  
    app.projects = new Projects();
    
    app.header.show(new Header());

    app.main.show(new ProjectsView({
      collection: app.projects
    }));

    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      app.projects.fetch({ data: $.param({ q: query }) });
    }

  }

  function initDashboard() {
  
    app.dashboard = new Dashboard();
    app.projects = new Projects();

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectsView({
      collection: app.projects
    }));

    app.dashboard.fetch();

    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      app.projects.fetch({ data: $.param({ q: query }) });
    }
    else {
      app.projects.fetch(); 
    }
  }

  switch(type){
    case "dashboard": 
      app.addInitializer(initDashboard);
      break;
    case "isearch":
      app.addInitializer(initISearch);
      break;
  }

  window.hackdash.app = app;
  window.hackdash.app.type = type;
  window.hackdash.app.start();

};