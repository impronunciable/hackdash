/**
 * VIEW: Dashboard Projects Layout
 *
 */

var template = require('./templates/index.hbs')
  , DashboardView = require('./Dashboard')
  , ProjectsView = require('../Project/Collection')

// Slider View Mode
  , ProjectItemView = require('../Project/Card')
  , EntityList = require("../Home/EntityList")
  , ProjectListSlider = EntityList.extend({ childView: ProjectItemView });

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
      return "//" + hackdash.baseURL;
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
    var slider = hackdash.getQueryVariable('slider');

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

    var projectsView;

    if (slider){
      this.$el.addClass('slider');

      if (sort){
        var s = '';

        switch(sort){
          case 'name': s = 'title'; break;
          case 'date': s = 'created_at'; break;
          case 'showcase': s = 'showcase'; break;
          default: s = 'created_at'; break;
        }

        if (s === 'showcase'){
          hackdash.app.projects = hackdash.app.projects.getActives();
        }

        hackdash.app.projects.runSort(s);
      }

      projectsView = new ProjectListSlider({
        model: this.model,
        collection: hackdash.app.projects,
        slides: parseInt(slider, 10)
      });
    }
    else {
      projectsView = new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects,
        showcaseMode: false,
        showcaseSort: false
      });

      projectsView.on('ended:render', function(){
        if (sort){
          hackdash.app.projects.trigger("sort:" + sort);
        }
      });
    }

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