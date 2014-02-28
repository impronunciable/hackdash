
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
    "keyup #searchInput": "search",
    "click .sort": "sort"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  lastSearch: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
    this.collection = options && options.collection;
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

  sort: function(e){
    e.preventDefault();
    var val = $(e.currentTarget).data("option-value");
    this.collection.trigger("sort:" + val);
  },

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
          
          var baseURL = hackdash.app.type;
          if (hackdash.app.type === "dashboard"){
            baseURL = "search";
          }

          window.history.pushState({}, "", baseURL + "?q=" + keyword);

          self.collection.fetch(opts);
        }
        else {
          if (hackdash.app.type === "isearch"){
            self.collection.reset();
          }
          else {
            self.collection.fetch();
          }
          window.history.pushState({}, "", hackdash.app.type === "isearch" ? "isearch" : "");
        }
      }
      
    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});