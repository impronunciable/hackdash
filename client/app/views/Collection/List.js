/**
 * VIEW: User Collections
 * 
 */

var template = require('./templates/list.hbs')
  , Collection = require('./ListItem');

module.exports = Backbone.Marionette.CompositeView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "modal my-collections-modal",
  template: template,
  itemView: Collection,
  itemViewContainer: ".collections",

  ui: {
    "title": "input[name=title]",
    "description": "input[name=description]"
  },

  events: {
    "click .close": "close",
    "click .btn-add": "add"
  },

  itemViewOptions: function(){
    return {
      dashboardId: this.model.get("_id")
    };
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  add: function(){
    if (this.ui.title.val()){
      this.collection.create({
        title: this.ui.title.val(),
        description: this.ui.description.val()
      }, { wait: true });

      this.ui.title.val("");
      this.ui.description.val("");
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});