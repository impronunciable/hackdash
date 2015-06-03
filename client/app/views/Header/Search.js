
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
    "click .btn-group>.btn": "sortClicked",
    "click .login": "showLogin"
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
      this.search();
    }
  },

  serializeData: function(){
    return _.extend({
      showSort: this.showSort,
      placeholder: this.placeholder
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showLogin: function(){
    hackdash.app.showLogin();
  },

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
      var currentSearch = decodeURI(Backbone.history.location.search);
      var fragment = Backbone.history.fragment.replace(currentSearch, "");

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        var url = fragment + "?q=" + keyword;
        if (keyword.length === 0) {
          url = fragment;
        }

        hackdash.app.router.navigate(url);
        self.collection.search(keyword);
        _gaq.push(['_trackEvent', 'Search', 'Project', keyword]);

        var top = $('#dashboard-projects').offset().top;
        var offset = self.$el.parent().height();
        var pos = (top - offset >= 0 ? top - offset : 0);
        $(window).scrollTop(pos);
      }

    }, 300);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
