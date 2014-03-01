/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")
  , Dashboards = require("./models/Dashboards")
  , Collections = require("./models/Collections")
  , Profile = require("./models/Profile")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , LoginView = require("./views/Login")
  , ProfileView = require("./views/Profile")
  , ProjectFullView = require("./views/Project/Full")
  , ProjectEditView = require("./views/Project/Edit")
  , ProjectsView = require("./views/Project/Collection")
  , DashboardsView = require("./views/Dashboard/Collection")
  , CollectionsView = require("./views/Collection/Collection");

module.exports = Backbone.Marionette.AppRouter.extend({
  
  routes : {
      "" : "showDashboard"
    
    , "login" : "showLogin"

    , "projects" : "showProjects"
    , "projects/create" : "showProjectCreate"
    , "projects/:pid/edit" : "showProjectEdit"
    , "projects/:pid" : "showProjectFull"

    , "dashboards" : "showDashboards"
    
    , "collections" : "showCollections"
    , "collections/:cid" : "showCollection"
    
    , "users/profile": "showProfile"
    , "users/:user_id" : "showProfile"
  },

  showLogin: function(){
    var providers = window.hackdash.providers;
    var app = window.hackdash.app;

    app.modals.show(new LoginView({
      model: new Backbone.Model({ providers: providers.split(',') })
    }));
  },

  showDashboard: function() {

    var app = window.hackdash.app;
    app.type = "dashboard";

    app.dashboard = new Dashboard();
    app.projects = new Projects();

    app.header.show(new Header({
      model: app.dashboard,
      collection: app.projects
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
  },

  showProjects: function() {

    var app = window.hackdash.app;
    app.type = "isearch";

    app.projects = new Projects();
    
    app.header.show(new Header({
      collection: app.projects
    }));

    app.main.show(new ProjectsView({
      collection: app.projects
    }));

    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      app.projects.fetch({ data: $.param({ q: query }) });
    }

  },

  showProjectCreate: function(){
    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project();
    
    app.header.show(new Header());

    app.main.show(new ProjectEditView({
      model: app.project
    }));
  },

  showProjectEdit: function(pid){
    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({ _id: pid });
    
    app.header.show(new Header());

    app.main.show(new ProjectEditView({
      model: app.project
    }));

    app.project.fetch();
  },

  showProjectFull: function(pid){
    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({ _id: pid });
    
    app.header.show(new Header());

    app.main.show(new ProjectFullView({
      model: app.project
    }));

    app.project.fetch();
  },

  showCSearch: function() {
    var app = window.hackdash.app;
    app.type = "csearch";

    app.collections = new Collections();
    
    app.header.show(new Header({
      collection: app.dashboards
    }));

    app.main.show(new CollectionsView({
      collection: app.collections
    }));

    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      app.collections.fetch({ data: $.param({ q: query }) });
    }

  },

  showProfile: function(userId) {
    var app = window.hackdash.app;
    app.type = "profile";

    if (!userId){
      if (hackdash.user){
        userId = hackdash.user._id;
      }
      else {
        window.location = "/";
      }
    }

    app.profile = new Profile({
      _id: userId
    });

    app.profile.fetch({ parse: true });

    app.header.show(new Header());

    app.main.show(new ProfileView({
      model: app.profile
    }));
  },

  showDashboards: function() {
    var app = window.hackdash.app;
    app.type = "dashboards";

    app.dashboards = new Dashboards();
    app.collections = new Collections();
    
    app.header.show(new Header({
      collection: app.dashboards
    }));

    app.main.show(new DashboardsView({
      collection: app.dashboards
    }));

    app.collections.fetch({ parse: true });

    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      app.dashboards.fetch({ data: $.param({ q: query }) });
    }

  }

});
