
var template = require("./templates/home.hbs")
  , Dashboards = require("../../models/Dashboards");

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container-fluid",
  template: template,

  ui: {
    "domain": "#domain",
    "create": "#create-dashboard",
    "projects": "#search-projects",
    "collections": "#search-collections"
  },

  events: {
    "keyup #domain": "validateDomain",
    "click #create-dashboard": "createDashboard",

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

  //TODO: move to i18n
  errors: {
    "subdomain_invalid": "Subdomain invalid",
    "subdomain_inuse": "Subdomain is in use"
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  validateDomain: function(){
    var name = this.ui.domain.val();
    this.cleanErrors();

    if(/^[a-z0-9]{5,10}$/.test(name)) {
      this.ui.domain.parent().addClass('success').removeClass('error');
      this.ui.create.removeClass('disabled');
    } else {
      this.ui.domain.parent().addClass('error').removeClass('success');
      this.ui.create.addClass('disabled');
    }

  },

  createDashboard: function(){
    var domain = this.ui.domain.val();

    this.cleanErrors();

    this.ui.create.button('loading');

    var dash = new Dashboards([]);

    dash.create({ domain: domain }, {
      success: this.redirectToSubdomain.bind(this, domain),
      error: this.showError.bind(this)
    });
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

  showError: function(view, err){
    this.ui.create.button('reset');

    if (err.responseText === "OK"){
      this.redirectToSubdomain(this.ui.domain.val());
      return;
    }

    var error = JSON.parse(err.responseText).error;

    this.ui.domain.parents('.control-group').addClass('error').removeClass('success');
    this.ui.domain.after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error").removeClass('success');
    $("span.help-inline", this.$el).remove();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  redirectToSubdomain: function(name){
    window.location = "http://" + name + "." + hackdash.baseURL;
  },

  isEnterKey: function(e){
    var key = e.keyCode || e.which;
    return (key === 13);
  }

});