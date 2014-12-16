/**
 * VIEW: Dashboard Projects Layout
 * 
 */

var template = require('./templates/layout.hbs')
  , ProjectsView = require('./Collection');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    inactiveCtn: ".inactive-ctn"
  },

  regions: {
    "dashboard": "#dashboard-projects",
    "inactives": "#inactive-projects"
  },
  
  modelEvents:{
    "edit:showcase": "onStartEditShowcase",
    "end:showcase": "onEndEditShowcase",
    "save:showcase": "onSaveEditShowcase"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  showcaseMode: false,
  showcaseSort: false,

  onRender: function(){
    
    if (this.showcaseMode){
      this.dashboard.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getActives(),
        showcaseMode: true
      }));

      this.ui.inactiveCtn.removeClass("hide");

      this.inactives.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects.getInactives()
      }));

      var self = this;
      hackdash.app.projects.off("change:active").on("change:active", function(){
        self.dashboard.currentView.collection = hackdash.app.projects.getActives();
        self.inactives.currentView.collection = hackdash.app.projects.getInactives();

        self.model.isDirty = true;

        self.dashboard.currentView.render();
        self.inactives.currentView.render();
      });
    }
    else {
      this.ui.inactiveCtn.addClass("hide");

      this.dashboard.show(new ProjectsView({
        model: this.model,
        collection: hackdash.app.projects,
        showcaseMode: false,
        showcaseSort: this.showcaseSort
      }));
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onStartEditShowcase: function(){
    this.showcaseMode = true;
    this.render();
  },

  onSaveEditShowcase: function(){
    var showcase = this.dashboard.currentView.updateShowcaseOrder();
    this.model.save({ "showcase": showcase });

    this.model.isDirty = false;
    this.onEndEditShowcase();
  },

  onEndEditShowcase: function(){
    this.model.isShowcaseMode = false;
    this.model.trigger("change");

    this.showcaseSort = true;
    this.showcaseMode = false;
    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});