/**
 * Landing Application
 *
 */

var 
    Search = require('./views/Search')
  , Projects = require('./models/Projects')
  , ProjectsView = require('./views/Projects');

var app = module.exports = new Backbone.Marionette.Application();

app.addInitializer( function () {

  app.addRegions({
    leftHeader: "div#left-header",
    main: "#main"
  });

  app.projects = new Projects();
  
  app.leftHeader.show(new Search());
  app.main.show(new ProjectsView({
    collection: app.projects
  }));

  var query = hackdash.getQueryVariable("q");
  if (query && query.length > 0){
    app.projects.fetch({ data: $.param({ q: query }) });
  }

});
