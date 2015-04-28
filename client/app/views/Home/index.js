
var template = require("./templates/home.hbs")
  , TabContent = require("./TabContent")
  , LoginView = require("../Login")
  , StatsView = require("./Stats")
  , TeamView = require("./Team")
  , PartnersView = require("./Partners")
  , FooterView = require("./Footer")

  // Collections
  , Dashboards = require("../../models/Dashboards")
  , Projects = require("../../models/Projects")
  , Users = require("../../models/Users")
  , Collections = require("../../models/Collections")
  , Team = require("../../models/Team");

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  regions:{
    "dashboards": "#dashboards",
    "projects": "#projects",
    "users": "#users",
    "collections": "#collections",

    "stats": ".stats-ctn",
    "team": ".team-ctn",
    "partners": ".partners-ctn",
    "footer": ".footer-ctn",
  },

  ui: {
    "domain": "#domain",
    "create": "#create-dashboard",
    "errorHolder": "#new-dashboard-error",

    "dashboards": "#dashboards",
    "projects": "#projects",
    "users": "#users",
    "collections": "#collections",

    "tabs": ".nav-tabs.landing",
    "mobileMenu": ".mobile-menu",
  },

  events: {
    "keyup @ui.domain": "validateDomain",
    "click @ui.domain": "checkLogin",
    "click @ui.create": "createDashboard",
    "click .up-button": "goTop",
    "click @ui.mobileMenu": "toggleMobileMenu"
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

    this.hdTeam = new Team();
    this.hdTeam.fetch();
  },

  onRender: function(){

    this.changeTab();

    if (!this.ui[this.section].hasClass("active")){
      this.ui[this.section].addClass("active");
    }

    this.stats.show(new StatsView());

    this.team.show(new TeamView({ collection: this.hdTeam }));
    this.partners.show(new PartnersView());

    this.footer.show(new FooterView());

    var self = this;
    _.defer(function(){
      if (self.ui.mobileMenu.is(':visible')){
        self.ui.tabs.addClass('hidden');
      }

      self.animateScroll();
    });
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

    if (this.ui.mobileMenu.is(':visible')){
      this.ui.tabs.addClass('hidden');
    }
  },

  toggleMobileMenu: function(){
    if (this.ui.mobileMenu.is(':visible')){
      if (this.ui.tabs.hasClass('hidden')){
        this.ui.tabs.removeClass('hidden');
      }
      else {
        this.ui.tabs.addClass('hidden');
      }
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  setSection: function(section){
    this.section = section;
    this.changeTab();
    this.animateScroll();
  },

  errors: {
    "subdomain_invalid": "5 to 10 chars, no spaces or special",
    "subdomain_inuse": "Sorry, that one is in use. Try another one."
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
        this.cleanErrors();
      } else {
        this.ui.errorHolder
          .removeClass('hidden')
          .text(this.errors.subdomain_invalid);
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

  showError: function(view, err){
    this.ui.create.button('reset');

    if (err.responseText === "OK"){
      this.redirectToSubdomain(this.ui.domain.val());
      return;
    }

    var error = JSON.parse(err.responseText).error;
    this.ui.errorHolder
      .removeClass('hidden')
      .text(this.errors[error]);
  },

  cleanErrors: function(){
    this.ui.errorHolder.addClass('hidden').text('');
  },

  goTop: function(){
    this.footer.currentView.goTop();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  animateScroll: function(){
    window.smoothScroll.animateScroll(null, '#' + this.section, {
      offset: (this.ui.mobileMenu.is(':visible') ? 0 : 60),
      speed: 100,
      easing: 'Linear'
    });
  },

  redirectToSubdomain: function(name){
    window.location = '/dashboards/' + name;
  },

  isEnterKey: function(e){
    var key = e.keyCode || e.which;
    return (key === 13);
  }

});