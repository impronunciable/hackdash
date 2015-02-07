/**
 * VIEW: Dashboards
 *
 */

var template = require("./templates/tabContent.hbs");

var Search = require("./Search");

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  regions: {
    "header": ".header",
    "content": ".content"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){

  },

  onRender: function(){
    this.header.show(new Search());

/*
    this.content.show(new CollectionType({
      model: this.model
    }));
*/
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