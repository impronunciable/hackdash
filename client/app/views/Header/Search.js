
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
  currentSort: "",

  initialize: function(options){
    this.showSort = (options && options.showSort) || false;
    this.collection = options && options.collection;
    this.placeholder = (options && options.placeholder) || __("Enter your keywords");
  },

  onRender: function(){
    var query = hackdash.getQueryVariable("q");
    var sort = hackdash.getQueryVariable('sort');

    if (query && query.length > 0){
      this.ui.searchbox.val(query);
      this.search();
    }

    if (sort && sort.length > 0){
      $('input[type=radio]', this.$el)
        .parents('label')
        .removeClass('active');

      $('input[type=radio]#' + sort, this.$el)
        .parents('label')
        .addClass('active');

      this.updateSort(sort);
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
    this.updateSort(val);
  },

  updateSort: function(sort){
    this.collection.trigger("sort:" + sort);

    if (sort !== this.currentSort){
      this.currentSort = sort;
      this.updateURL();
    }
  },

  search: function(){
    var self = this;
    window.clearTimeout(this.timer);

    this.timer = window.setTimeout(function(){
      var keyword = self.ui.searchbox.val();

      if (keyword !== self.lastSearch) {
        self.lastSearch = keyword;

        self.updateURL();
        self.collection.search(keyword);

        var top = $('#dashboard-projects').offset().top;
        var offset = self.$el.parent().height();
        var pos = (top - offset >= 0 ? top - offset : 0);
        $(window).scrollTop(pos);

        var dash = hackdash.app.dashboard;
        var domain = dash && dash.get('domain') || 'unkonwn';
        window._gaq.push(['_trackEvent', 'DashSearch', domain, keyword]);
      }

    }, 300);
  },

  updateURL: function(){
    var keywords = (this.lastSearch ? 'q=' + this.lastSearch : '');
    var sort = (this.currentSort ? 'sort=' + this.currentSort : '');

    var current = decodeURI(Backbone.history.location.search);
    var fragment = Backbone.history.fragment.replace(current, "");

    var search = '?';

    if (keywords){
      search += keywords;
    }

    if (sort){
      search += (keywords ? '&' + sort : sort);
    }

    hackdash.app.router.navigate(fragment + search);
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});
