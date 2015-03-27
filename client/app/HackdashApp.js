/**
 * Landing Application
 *
 */

var HackdashRouter = require('./HackdashRouter')
  , LoginView = require("./views/Login")
  , ModalRegion = require('./views/ModalRegion');

module.exports = function(){

  var app = module.exports = new Backbone.Marionette.Application();

  function initRegions(){
    app.addRegions({
      header: "header",
      main: "#main",
      footer: "footer",
      modals: ModalRegion
    });

    app.showLogin = function(){
      var providers = window.hackdash.providers;

      app.modals.show(new LoginView({
        model: new Backbone.Model({ providers: providers.split(',') })
      }));
    };
  }

  function initRouter(){
    app.router = new HackdashRouter();
    app.router.on("route", function(/*route, params*/) {
      app.previousURL = Backbone.history.fragment;
    });
    Backbone.history.start({ pushState: true });
  }

  app.addInitializer(initRegions);
  app.addInitializer(initRouter);

  window.hackdash.app = app;
  window.hackdash.app.start();

  // Add navigation for BackboneRouter to all links
  // unless they have attribute "data-bypass"
  $(window.document).on("click", "a:not([data-bypass])", function(evt) {
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    var root = window.location.protocol + "//" + window.location.host + (app.root || "");

    if (href.prop && href.prop.slice(0, root.length) === root) {
      evt.preventDefault();
      Backbone.history.navigate(href.attr, { trigger: true });
    }
  });

};