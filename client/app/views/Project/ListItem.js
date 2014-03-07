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
    this.isCollection = (options && options.isCollection) || false;
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
    else if(this.isCollection){
      url = "/collections/" + this.model.get("_id");
    }
    else {
      url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
        "/projects/" + this.model.get("_id");
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