/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")
//  , Dashboards = require("./models/Dashboards")
  , Collection = require("./models/Collection")
//  , Collections = require("./models/Collections")
  , Profile = require("./models/Profile")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , HomeLayout = require("./views/Home")
  , LoginView = require("./views/Login")
  , ProfileView = require("./views/Profile")
  , ProjectFullView = require("./views/Project/Full")
  , ProjectEditView = require("./views/Project/Edit")
  , DashboardView = require("./views/Dashboard")
  , DashboardsView = require("./views/Dashboard/Collection")
//  , CollectionsView = require("./views/Collection/Collection")
  ;

module.exports = Backbone.Marionette.AppRouter.extend({

  routes : {
      "" : "showHome"

    , "login" : "showLogin"

    // LANDING
    , "dashboards" : "showLandingDashboards"
    , "projects" : "showLandingProjects"
    , "users" : "showLandingUsers"
    , "collections" : "showLandingCollections"

    // APP
    , "dashboards/:dash": "showDashboard"
    , "dashboards/:dash/create": "showProjectCreate"

    , "projects/:pid/edit" : "showProjectEdit"
    , "projects/:pid" : "showProjectFull"

    , "collections/:cid" : "showCollection"

    , "users/profile": "showProfile"
    , "users/:user_id" : "showProfile"

  },

  showHome: function(){
    this.homeView = new HomeLayout();
    var app = window.hackdash.app;
    app.main.show(this.homeView);
  },

  getSearchQuery: function(){
    var query = hackdash.getQueryVariable("q");
    var fetchData = {};
    if (query && query.length > 0){
      fetchData = { data: $.param({ q: query }) };
    }

    return fetchData;
  },

  showLogin: function(){
    var providers = window.hackdash.providers;
    var app = window.hackdash.app;

    app.modals.show(new LoginView({
      model: new Backbone.Model({ providers: providers.split(',') })
    }));
  },

  showHomeSection: function(section){
    if (this.homeView){
      this.homeView.setSection(section);
    }
    else {
      var main = hackdash.app.main;
      this.homeView = new HomeLayout({
        section: section
      });

      main.show(this.homeView);
    }

    smoothScroll.animateScroll(null, '#' + section, {
      offset: 60,
      speed: 1000,
      easing: 'easeInOut'
    });
  },

  showLandingDashboards: function(){
    this.showHomeSection("dashboards");
  },

  showLandingProjects: function(){
    this.showHomeSection("projects");
  },

  showLandingUsers: function(){
    this.showHomeSection("users");
  },

  showLandingCollections: function(){
    this.showHomeSection("collections");
  },

  showDashboard: function(dash) {

    var app = window.hackdash.app;
    app.type = "dashboard";

    app.dashboard = new Dashboard();
    app.projects = new Projects();

    if (dash){
      app.dashboard.set('domain', dash);
      app.projects.domain = dash;
    }

    var self = this;
    app.dashboard.fetch().done(function(){
      app.projects.fetch(self.getSearchQuery(), { parse: true })
        .done(function(){
          app.projects.buildShowcase(app.dashboard.get("showcase"));

          app.header.show(new Header({
            model: app.dashboard,
            collection: app.projects
          }));

          app.main.show(new DashboardView({
            model: app.dashboard
          }));

          app.footer.show(new Footer({
            model: app.dashboard
          }));

        });
    });

  },

  showProjectCreate: function(dashboard){

    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({
      domain: dashboard
    });

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

    app.project.fetch().done(function(){

      app.main.show(new ProjectEditView({
        model: app.project
      }));
    });
  },

  showProjectFull: function(pid){

    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({ _id: pid });

    app.header.show(new Header());

    app.project.fetch().done(function(){

      app.main.show(new ProjectFullView({
        model: app.project
      }));
    });
  },

  showCollection: function(collectionId) {

    var app = window.hackdash.app;
    app.type = "collection";

    app.collection = new Collection({ _id: collectionId });

    app.collection
      .fetch({ parse: true })
      .done(function(){

        app.header.show(new Header({
          model: app.collection
        }));

        app.main.show(new DashboardsView({
          hideAdd: true,
          collection: app.collection.get("dashboards")
        }));
      });
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

});
