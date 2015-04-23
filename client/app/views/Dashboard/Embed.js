/**
 * VIEW: Dashboard Projects Layout
 *
 */

var template = require('./templates/index.hbs')
  , DashboardView = require('./Dashboard')
  , ProjectsView = require('../Project/Collection');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "page-ctn dashboard",
  template: template,

  regions: {
    "dashboard": ".dash-details",
    "projects": "#dashboard-projects",
  },

  templateHelpers: {
    hackdashURL: function(){
      return "http://" + hackdash.baseURL;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    this.settings = this.getSettings();
  },

  onRender: function(){
    var self = this;

    var sort = hackdash.getQueryVariable('sort');
    var query = hackdash.getQueryVariable('query');
    var status = hackdash.getQueryVariable('status');

    if (query){
      hackdash.app.projects.search(query);
    }

    if (status){
      hackdash.app.projects.reset(
        hackdash.app.projects.where({ status: status })
      );
    }

    var dashboardView = new DashboardView({
      model: this.model
    });

    var projectsView = new ProjectsView({
      model: this.model,
      collection: hackdash.app.projects,
      showcaseMode: false,
      showcaseSort: false
    });

    dashboardView.on('show', function(){
      var ctn = self.dashboard.$el;

      if (!self.settings.title){
        $('h1', ctn).remove();
      }
      if (!self.settings.desc){
        $('p', ctn).remove();
      }
      if (!self.settings.logo){
        $('.logo', ctn).remove();
      }

      if (!self.settings.title && !self.settings.desc){
        $('.header', self.$el).addClass('hidden');
        $('.body .container', self.$el).css('margin-top', 0);
      }
    });

    projectsView.on('show', function(){
      var ctn = self.projects.$el;

      if (!self.settings.pprg){
        $('.progress', ctn).remove();
      }
      if (!self.settings.ptitle){
        $('.details h2', ctn).remove();
      }
      if (!self.settings.pcontrib){
        $('.contributors', ctn).remove();
      }
      if (!self.settings.pacnbar){
        $('.action-bar', ctn).remove();
      }
    });

    projectsView.on('ended:render', function(){
      if (sort){
        hackdash.app.projects.trigger("sort:" + sort);
      }
    });

    this.dashboard.show(dashboardView);
    this.projects.show(projectsView);

    _.defer(function(){
      $('.dash-admins, .dash-buttons, .inactive-ctn').remove();
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  getSettings: function(){
    var settings = ['title', 'desc', 'logo', 'pprg', 'ptitle', 'pcontrib','pacnbar'];
    var hide = hackdash.getQueryVariable('hide');
    hide = (hide && hide.split(',')) || [];

    hide = _.difference(settings, hide);
    var values = _.range(hide.length).map(function () { return 1; });

    return _.object(hide, values);
  }


});