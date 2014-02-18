
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

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      this.ui.searchbox.val(query);
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  search: function(){
    var self = this;
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout(function(){
      var keyword = self.ui.searchbox.val();

      var opts = {
        reset: true
      };

      if (keyword.length > 0) {
        opts.data = $.param({ q: keyword });
        window.history.pushState({}, "", "isearch?q=" + keyword);
        hackdash.app.projects.fetch(opts);
      }
      else {
        hackdash.app.projects.reset();        
        window.history.pushState({}, "", "isearch");
      }
      
    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});