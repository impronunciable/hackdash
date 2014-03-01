/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/listItem.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li tooltips",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.isDashboard = (options && options.isDashboard) || false;
  },

  onRender: function(){
    this.$el
      .addClass(this.model.get("status"))
      .attr({
        "title": this.model.get("status"),
        "data-placement": "left"
      })
      .tooltip({});
  },

  serializeData: function(){
    var url;

    if (this.isDashboard){
      url = "http://" + this.model.get("title")  + "." + hackdash.baseURL;
    }
    else {
      url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
        "/p/" + this.model.get("_id");
    }

    return _.extend({
      url: url
    }, this.model.toJSON());
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