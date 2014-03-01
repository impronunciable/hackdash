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
    "click input[type=checkbox]": "toggleDashboard"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.dashboardId = options.dashboardId;
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

  toggleDashboard: function(){
    if (this.hasDashboard()){
      this.model.removeDashboard(this.dashboardId);
    }
    else {
      this.model.addDashboard(this.dashboardId);
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  hasDashboard: function(){
    return this.model.get("dashboards").where({ _id: this.dashboardId}).length > 0;
  }

});