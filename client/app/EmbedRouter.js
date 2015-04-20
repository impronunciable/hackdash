/*
 * Hackdash Router
 */

var Dashboard = require("./models/Dashboard")
  , Project = require("./models/Project")
  , Projects = require("./models/Projects")

  //, Header = require("./views/Header/Embed")

  , ProjectView = require("./views/Project/Embed")
  , DashboardView = require("./views/Dashboard/Embed")
  ;

module.exports = Backbone.Marionette.AppRouter.extend({

  routes : {

      "embed/dashboards/:dash": "showDashboard"
    , "embed/projects/:pid" : "showProject"

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

    app.dashboard.fetch().done(function(){
      app.projects.fetch({}, { parse: true })
        .done(function(){
          app.projects.buildShowcase(app.dashboard.get("showcase"));
/*
          app.header.show(new Header({
            model: app.dashboard,
            collection: app.projects
          }));
*/
          app.main.show(new DashboardView({
            model: app.dashboard
          }));

        });
    });

  },

  showProject: function(pid){

    var app = window.hackdash.app;
    app.type = "project";

    app.project = new Project({ _id: pid });

    app.project.fetch().done(function(){
      app.main.show(new ProjectView({
        model: app.project
      }));
    });
  },

});
