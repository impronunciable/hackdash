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

  events: {
    "click .view-collection": "viewCollection"
  },

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

    this.$el.on("click", this.toggleDashboard.bind(this));
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

  viewCollection: function(e){
    e.stopPropagation();
    hackdash.app.modals.close();
  },

  toggleDashboard: function(){
    if (this.hasDashboard()){
      this.model.removeDashboard(this.dashboardId);
    }
    else {
      this.model.addDashboard(this.dashboardId);
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