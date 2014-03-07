
var 
    template = require("./templates/home.hbs");

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container-fluid",
  template: template,

  ui: {
    "domain": "#domain",
    "create": "input[type=submit]",
    "projects": "#search-projects",
    "collections": "#search-collections"
  },

  events: {
    "keyup #domain": "validateDomain",

    "keyup #search-projects": "checkSearchProjects",
    "click #search-projects-btn": "searchProjects",

    "keyup #search-collections": "checkSearchCollections",
    "click #search-collections-btn": "searchCollections",

    "click #create-collections-btn": "createCollections"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  validateDomain: function(){
    var name = this.ui.domain.val();
    if(/^[a-z0-9]{5,10}$/.test(name)) {
      this.ui.domain.parent().addClass('success').removeClass('error');
      this.ui.create.removeClass('disabled');
    } else {
      this.ui.domain.parent().addClass('error').removeClass('success');
      this.ui.create.addClass('disabled');
    }
  },

  checkSearchProjects: function(e){
    if (this.isEnterKey(e)){
      this.searchProjects();
    }
  },

  checkSearchCollections: function(e){
    if (this.isEnterKey(e)){
      this.searchCollections();
    }
  },

  searchProjects: function(){
    var q = this.ui.projects.val();
    q = q ? "?q=" + q : "";
    
    window.location = "/projects" + q;
  },

  searchCollections: function(){
    var q = this.ui.collections.val();
    q = q ? "?q=" + q : "";

    window.location = "/collections" + q;
  },

  createCollections: function(){
    window.location = "/dashboards";
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isEnterKey: function(e){
    var key = e.keyCode || e.which;
    return (key === 13);
  }

});