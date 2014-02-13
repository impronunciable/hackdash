/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/project.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "project tooltips span4",
  template: template,

  templateHelpers: {
    projectURL: function(){
      return "http://" + this.domain + "." + hackdash.baseURL + "/p/" + this._id;
    }
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el.addClass(this.model.get("status"));

    this.$el.attr({
      /*
      "data-id": this.model.get("_id"),
      "data-contribs": this.model.get("contributors").length,
      "data-name": this.model.get("name"),
      "data-date": this.model.get("created_at"),
      */
      "title": this.model.get("status")
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