/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/projectListItem.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el
      .addClass(this.model.get("status"))
      .tooltip({});

    $('.tooltips', this.$el).tooltip({});

    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
      "/p/" + this.model.get("_id");

    this.$el.on("click", function(){
      window.location = url;
    });
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