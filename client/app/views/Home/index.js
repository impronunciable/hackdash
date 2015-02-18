
var template = require("./templates/home.hbs")
  , Dashboards = require("../../models/Dashboards")
  , TabContent = require("./TabContent")
  , LoginView = require("../Login")
  , StatsView = require("./Stats")

  // Collections
  , Dashboards = require("../../models/Dashboards")
  , Projects = require("../../models/Projects")
  , Users = require("../../models/Users")
  , Collections = require("../../models/Collections");

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  //className: "container-fluid",
  template: template,

  regions:{
    "dashboards": "#dashboards",
    "projects": "#projects",
    "users": "#users",
    "collections": "#collections",
    "stats": ".stats-ctn",
  },

  ui: {
    "domain": "#domain",
    "create": "#create-dashboard",

    "dashboards": "#dashboards",
    "projects": "#projects",
    "users": "#users",
    "collections": "#collections",
/*
    "projects": "#search-projects",
    "collections": "#search-collections"
*/
  },

  events: {
    "keyup #domain": "validateDomain",
    "click #domain": "checkLogin",
    "click #create-dashboard": "createDashboard",
/*
    "keyup #search-projects": "checkSearchProjects",
    "click #search-projects-btn": "searchProjects",

    "keyup #search-collections": "checkSearchCollections",
    "click #search-collections-btn": "searchCollections",

    "click #create-collections-btn": "createCollections"
*/
  },

  lists: {
    projects: null,
    dashboards: null,
    users: null,
    collections: null
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.section = (options && options.section) || "dashboards";
  },

  onRender: function(){

    this.changeTab();

    if (!this.ui[this.section].hasClass("active")){
      this.ui[this.section].addClass("active");
    }

    this.stats.show(new StatsView());
  },

  getNewList: function(type){
    switch(type){
      case "dashboards": return new Dashboards();
      case "projects": return new Projects();
      case "users": return new Users();
      case "collections": return new Collections();
    }
  },

  changeTab: function(){

    if (!this[this.section].currentView){

      this.lists[this.section] =
        this.lists[this.section] || this.getNewList(this.section);

      this[this.section].show(new TabContent({
        collection: this.lists[this.section]
      }));
    }

    this.ui[this.section].tab("show");
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  setSection: function(section){
    this.section = section;
    this.changeTab();
  },

  //TODO: move to i18n
  errors: {
    "subdomain_invalid": "Subdomain invalid",
    "subdomain_inuse": "Subdomain is in use"
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  checkLogin: function(){
    if (window.hackdash.user){
      return true;
    }

    var providers = window.hackdash.providers;
    var app = window.hackdash.app;

    app.modals.show(new LoginView({
      model: new Backbone.Model({ providers: providers.split(',') })
    }));

    return false;
  },

  validateDomain: function(){
    if (this.checkLogin()){
      var name = this.ui.domain.val();
      this.cleanErrors();

      if(/^[a-z0-9]{5,10}$/.test(name)) {
        this.ui.domain.parent().addClass('success').removeClass('error');
        this.ui.create.removeClass('disabled');
      } else {
        this.ui.domain.parent().addClass('error').removeClass('success');
        this.ui.create.addClass('disabled');
      }
    }
  },

  createDashboard: function(){
    if (this.checkLogin()){
      var domain = this.ui.domain.val();

      this.cleanErrors();

      this.ui.create.button('loading');

      var dash = new Dashboards([]);

      dash.create({ domain: domain }, {
        success: this.redirectToSubdomain.bind(this, domain),
        error: this.showError.bind(this)
      });
    }
  },
/*
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
*/
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