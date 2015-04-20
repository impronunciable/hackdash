/**
 * Embed Application
 *
 */

var EmbedRouter = require('./EmbedRouter');

module.exports = function(){

  var app = module.exports = new Backbone.Marionette.Application();

  app.source = "embed";

  function initRegions(){
    app.addRegions({
      header: "header",
      main: "#main",
      footer: "footer"
    });

    $('body').addClass('embedapp');
  }

  function initRouter(){
    app.router = new EmbedRouter();
    Backbone.history.start({ pushState: true });
  }

  app.addInitializer(initRegions);
  app.addInitializer(initRouter);

  window.hackdash.app = app;
  window.hackdash.app.start();
};