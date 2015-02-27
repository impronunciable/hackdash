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
    this.type = (options && options.type) || "projects";
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

    switch(this.type){
      case "collections":
        url = "http://" + hackdash.baseURL + "/collections/" + this.model.get("_id");
        break;
      case "dashboards":
        url = "http://" + hackdash.baseURL + "/dashboards/" + this.model.get("title");
        break;
      case "projects":
      case "contributions":
      case "likes":
        url = "http://" + hackdash.baseURL + "/projects/" + this.model.get("_id");
        break;
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