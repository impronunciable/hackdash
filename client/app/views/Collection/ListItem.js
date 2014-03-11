/**
 * VIEW: A User Collection
 * 
 */
 
var template = require('./templates/listItem.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.dashboardId = options.dashboardId;
  },

  onRender: function(){
    if (this.hasDashboard()){
      this.$el.addClass('active');
    }
    else {
      this.$el.removeClass('active'); 
    }

    this.$el.off("click").on("click", this.toggleDashboard.bind(this));
  },

  serializeData: function(){
    return _.extend({
      hasDash: this.hasDashboard()
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  viewCollection: function(){
    this.$el.off("click");
    hackdash.app.modals.close();
  },

  toggleDashboard: function(e){
    if ($(e.target).hasClass("view-collection")){
      this.viewCollection();
      return;
    }

    if (this.hasDashboard()){
      this.model.removeDashboard(this.dashboardId);
      hackdash.app.modals.currentView.removedCollection(this.model.get("title"));
    }
    else {
      this.model.addDashboard(this.dashboardId);
      hackdash.app.modals.currentView.addedCollection(this.model.get("title"));
    }

    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  hasDashboard: function(){
    return this.model.get("dashboards").where({ _id: this.dashboardId}).length > 0;
  }

});