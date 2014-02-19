
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

  lastSearch: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
  },

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      this.ui.searchbox.val(query);
      this.lastSearch = query;
    }
  },

  serializeData: function(){
    return {
      showSort: this.showSort
    };
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

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        var opts = {
          reset: true
        };

        if (keyword.length > 0) {
          opts.data = $.param({ q: keyword });
          
          var baseURL = (window.hackdash.app.type === "isearch" ? "isearch" : "search");
          window.history.pushState({}, "", baseURL + "?q=" + keyword);

          hackdash.app.projects.fetch(opts);
        }
        else {
          if (window.hackdash.app.type === "isearch"){
            hackdash.app.projects.reset();
          }
          else {
            hackdash.app.projects.fetch();
          }
          window.history.pushState({}, "", window.hackdash.app.type === "isearch" ? "isearch" : "");
        }
      }
      
    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});