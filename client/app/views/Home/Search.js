
var
  template = require('./templates/search.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "landing-search",
  template: template,

  ui: {
    searchbox: "#search"
  },

  events: {
    "keyup #search": "search"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  lastSearch: null,

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    if (query && query.length > 0){
      this.ui.searchbox.val(query);
      //this.lastSearch = query;
    }

    this.search();
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

  search: function(){
    var self = this;
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout(function(){
      var keyword = self.ui.searchbox.val();
      var currentSearch = decodeURI(Backbone.history.location.search);
      var fragment = Backbone.history.fragment.replace(currentSearch, "");

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        if (keyword.length > 0) {
          fragment = (!fragment.length ? "dashboards" : fragment);
          hackdash.app.router.navigate(fragment + "?q=" + keyword, { trigger: true });

          self.collection.fetch({
            reset: true,
            data: $.param({ q: keyword })
          });
        }
        else {
          hackdash.app.router.navigate(fragment, { trigger: true, replace: true });
          self.collection.fetch({ reset: true });
        }
      }

    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});