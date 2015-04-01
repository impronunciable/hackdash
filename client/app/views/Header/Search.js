
var
  template = require('./templates/search.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "search",
  template: template,

  ui: {
    searchbox: "#search"
  },

  events: {
    "keyup @ui.searchbox": "search",
    "click .btn-group>.btn": "sortClicked"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  lastSearch: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
    this.collection = options && options.collection;
    this.placeholder = (options && options.placeholder) || "Enter your keywords";
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

  sortClicked: function(e){
    e.preventDefault();
    var val = $('input[type=radio]', e.currentTarget)[0].id;
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

          hackdash.app.router.navigate(fragment + "?q=" + keyword);
          self.collection.fetch(opts);
        }
        else {
          hackdash.app.router.navigate(fragment);
          self.collection.fetch(opts);
        }
      }

    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});