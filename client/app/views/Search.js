
var 
  template = require('./templates/search.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "form",
  className: "formSearch",
  template: template,

  ui: {
    searchbox: "#searchInput"
  },

  events: {
    "keyup #searchInput": "search"
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

  search: function(){
    var keyword = this.ui.searchbox.val();

    var opts = {
      reset: true
    };

    if (keyword.length > 0) {
      opts.data = $.param({ q: keyword });
    }

    hackdash.app.projects.fetch(opts);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});