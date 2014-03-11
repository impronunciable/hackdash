
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
    this.placeholder = (options && options.placeholder) || "Type here";
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
      showSort: this.showSort,
      placeholder: this.placeholder
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
      var fragment = Backbone.history.fragment.replace(Backbone.history.location.search, "");

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        var opts = {
          reset: true
        };

        if (keyword.length > 0) {
          opts.data = $.param({ q: keyword });
          
          hackdash.app.router.navigate(fragment + "?q=" + keyword, { trigger: true });

          self.collection.fetch(opts);
        }
        else {
          if (hackdash.app.type === "isearch"){
            self.collection.reset();
          }
          else {
            self.collection.fetch();
          }

          hackdash.app.router.navigate(fragment, { trigger: true, replace: true });
        }
      }
      
    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});