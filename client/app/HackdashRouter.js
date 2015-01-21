/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")
  , Dashboards = require("./models/Dashboards")
  , Collection = require("./models/Collection")
  , Collections = require("./models/Collections")
  , Profile = require("./models/Profile")

  , Header = require("./views/Header")
  , Footer = require("./views/Footer")

  , HomeLayout = require("./views/Home")
  , LoginView = require("./views/Login")
  , ProfileView = require("./views/Profile")
  , ProjectFullView = require("./views/Project/Full")
  , ProjectEditView = require("./views/Project/Edit")
  , ProjectsView = require("./views/Project/Layout")
  , DashboardsView = require("./views/Dashboard/Collection")
  , CollectionsView = require("./views/Collection/Collection");

module.exports = Backbone.Marionette.AppRouter.extend({

  routes : {
      "" : "index"

    , "login" : "showLogin"

    , "projects" : "showProjects"
    , "projects/create" : "showProjectCreate"
    , "projects/:pid/edit" : "showProjectEdit"
    , "projects/:pid" : "showProjectFull"

    , "dashboards" : "showDashboards"
    , "dashboards/:dash": "showDashboard"

    , "collections" : "showCollections"
    , "collections/:cid" : "showCollection"

    , "users/profile": "showProfile"
    , "users/:user_id" : "showProfile"
  },

  index: function(){
    if (hackdash.subdomain){
      this.showDashboard();
    }
    else {
      this.showHome();
    }
  },

  removeHomeLayout: function(){
    $('body').removeClass("homepage");
    $('header').add('footer').show();
    $('#page').addClass('container');
  },

  showHome: function(){
    $('body').addClass("homepage");
    $('header').add('footer').hide();
    $('#page').removeClass('container');

    var app = window.hackdash.app;
    app.main.show(new HomeLayout());
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

  showDashboard: function(dash) {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "dashboard";

    app.dashboard = new Dashboard();
    app.projects = new Projects();

    if (dash){
      app.dashboard.set('domain', dash);
      app.projects.domain = dash;
    }

    app.header.show(new Header({
      model: app.dashboard,
      collection: app.projects
    }));

    app.main.show(new ProjectsView({
      model: app.dashboard,
      collection: app.projects
    }));

    app.footer.show(new Footer({
      model: app.dashboard
    }));

    var self = this;
    app.dashboard.fetch().done(function(){
      app.projects.fetch(self.getSearchQuery(), { parse: true })
        .done(function(){
          app.projects.buildShowcase(app.dashboard.get("showcase"));
        });
    });

  },

  showProjects: function() {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "isearch";

    app.projects = new Projects();

    app.header.show(new Header({
      collection: app.projects
    }));

    app.main.show(new ProjectsView({
      collection: app.projects
    }));

    app.projects.fetch(this.getSearchQuery());
  },

  showProjectCreate: function(){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project();

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectEditView({
      model: app.project
    }));

    app.dashboard.fetch();
  },

  showProjectEdit: function(pid){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project({ _id: pid });

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectEditView({
      model: app.project
    }));

    app.dashboard.fetch();
    app.project.fetch();
  },

  showProjectFull: function(pid){
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "project";

    app.dashboard = new Dashboard();
    app.project = new Project({ _id: pid });

    app.header.show(new Header({
      model: app.dashboard
    }));

    app.main.show(new ProjectFullView({
      model: app.project
    }));

    app.dashboard.fetch();
    app.project.fetch();
  },

  showCollections: function() {
    this.removeHomeLayout();

    var app = window.hackdash.app;
    app.type = "collections";

    app.collections = new Collections();

    app.header.show(new Header({
      collection: app.collections
    }));

    app.main.show(new CollectionsView({
      collection: app.collections
    }));

    app.collections.fetch(this.getSearchQuery());
  },

  showCollection: function(collectionId) {
    this.removeHomeLayout();

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
    this.removeHomeLayout();

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
    this.removeHomeLayout();

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

    app.collections.getMines();

    app.dashboards.fetch(this.getSearchQuery());
  }

});
