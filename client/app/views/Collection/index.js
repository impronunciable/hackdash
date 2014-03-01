/**
 * VIEW: Collection
 * 
 */
 
var template = require('./templates/collection.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "collection span4",
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    var url = "http://" + hackdash.baseURL + "/collections/" + this.model.get("_id");

    this.$el.on("click", function(e){
      if (!$(e.target).hasClass("add")){
        window.location = url;
      }
    });
  },

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