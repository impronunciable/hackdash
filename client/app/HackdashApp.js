/**
 * Landing Application
 *
 */

var 
    Dashboard = require("./models/Dashboard")
  , Projects = require("./models/Projects")
  , Profile = require("./models/Profile")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , ProfileView = require("./views/Profile")
  , ProjectsView = require("./views/Projects");

module.exports = function(type){

  var app = module.exports = new Backbone.Marionette.Application();

  app.addRegions({
    header: "header",
    main: "#main",
    footer: "footer"
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

  function initProfile() {

    var userId = (window.location.pathname.split('/').pop()).split('?')[0];
    
    app.profile = new Profile({
      _id: userId
    });

    app.profile.fetch({ parse: true });

    app.header.show(new Header());

    app.main.show(new ProfileView({
      model: app.profile
    }));
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

    app.footer.show(new Footer({
      model: app.dashboard
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
    case "profile":
      app.addInitializer(initProfile);
      break;
  }

  window.hackdash.app = app;
  window.hackdash.app.type = type;
  window.hackdash.app.start();

};