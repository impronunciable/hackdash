
var 
    template = require('./templates/header.hbs')
  , Search = require('./Search')
  , DashboardHeader = require('./Dashboard')
  , CollectionsHeader = require('./Collections')
  , CollectionHeader = require('./Collection');

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

  templateHelpers: {
    hackdashURL: function(){
      return "http://" + hackdash.baseURL;
    },
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var type = window.hackdash.app.type;
    
    var self = this;
    function showSearch(){
      self.search.show(new Search({
        showSort: type === "dashboard",
        collection: self.collection
      }));
    }

    switch(type){
      case "isearch":
        showSearch();
        this.ui.pageTitle.text("Search Projects");
        break;

      case "csearch":
        showSearch();
        this.page.show(new CollectionsHeader());
        break;

      case "dashboards":
        showSearch();
        this.ui.pageTitle.text("Search Instances");
        break;

      case "dashboard":
        showSearch();
        
        if (this.model.get("_id")){
          this.page.show(new DashboardHeader({
            model: this.model
          }));
        }
        break;

      case "collection":
        showSearch();
        
        if (this.model.get("_id")){
          this.page.show(new CollectionHeader({
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