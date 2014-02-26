
var 
    template = require("./templates/profile.hbs")
  , ProjectList = require("./ProjectList");

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container profile-ctn",
  template: template,

  regions: {
    "dashboards": ".dashboards-ctn",
    "projects": ".projects-ctn",
    "contributions": ".contributions-ctn",
    "likes": ".likes-ctn",
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    this.dashboards.show(new ProjectList({
      collection: this.model.get("dashboards")
    }));

    this.projects.show(new ProjectList({
      collection: this.model.get("projects")
    }));
    
    this.contributions.show(new ProjectList({
      collection: this.model.get("contributions")
    }));

    this.likes.show(new ProjectList({
      collection: this.model.get("likes")
    }));

    $('.tooltips', this.$el).tooltip({});
  }

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});