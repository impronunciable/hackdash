/**
 * VIEW: Profile Item List
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
        url = "http://" + hackdash.baseURL + "/dashboards/" + this.model.get("domain");
        break;
      case "projects":
      case "contributions":
      case "likes":
        url = "http://" + hackdash.baseURL + "/projects/" + this.model.get("_id");
        break;
    }

    var showImage = (this.type === "collections" || this.type === "dashboards" ? false : true);
    if (showImage){
      showImage = this.model.get('cover');
    }

    return _.extend({
      showImage: showImage,
      type: this.type,
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