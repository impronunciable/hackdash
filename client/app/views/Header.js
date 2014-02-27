
var 
    template = require('./templates/header.hbs')
  , Search = require('./Search')
  , DashboardDetails = require('./DashboardDetails');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container",
  template: template,

  regions: {
    "search": ".search-ctn",
    "page": ".page-ctn"
  },

  ui: {
    pageTitle: ".page-title"
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var type = window.hackdash.app.type;
    
    var self = this;
    function showSearch(){
      self.search.show(new Search({
        showSort: type === "dashboard"
      }));
    }

    switch(type){
      case "isearch":
        showSearch();
        this.ui.pageTitle.text("Search Projects");
        break;

      case "csearch":
        showSearch();
        this.ui.pageTitle.text("Search Collections");
        break;

      case "dashboard":
        showSearch();
        
        if (this.model.get("_id")){
          this.page.show(new DashboardDetails({
            model: this.model
          }));
        }
        break;
    }

    $('.tooltips', this.$el).tooltip({});
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});