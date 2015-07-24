
var
    template = require("./templates/profile.hbs")
  , ProfileCard = require("./Card")
  , ProfileCardEdit = require("./CardEdit")
  , EntityList = require("./EntityList");

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "page-ctn profile",
  template: template,

  regions: {
    "profileCard": ".profile-card",

    "collections": "#collections",
    "dashboards": "#dashboards",
    "projects": "#projects",
    "contributions": "#contributions",
    "likes": "#likes",
  },

  ui: {
    "collections": "#collections",
    "dashboards": "#dashboards",
    "projects": "#projects",
    "contributions": "#contributions",
    "likes": "#likes",
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.section = (options && options.section) || "dashboards";
    this.isMyProfile = (hackdash.user && this.model.get("_id") === hackdash.user._id ? true : false);
  },

  onRender: function(){

    this.changeTab();

    if (!this.ui[this.section].hasClass("active")){
      this.ui[this.section].addClass("active");
    }

    if (this.isMyProfile){
      this.profileCard.show(new ProfileCardEdit({
        model: this.model
      }));
    }
    else {
      this.profileCard.show(new ProfileCard({
        model: this.model
      }));
    }

    $('.tooltips', this.$el).tooltip({});

    $('a[data-toggle="tab"]', this.$el).on('shown.bs.tab', this.setSection.bind(this));
    $('html, body').scrollTop(0);
  },

  changeTab: function(){
    if (!this[this.section].currentView){

      this[this.section].show(new EntityList({
        collection: this.model.get(this.section),
        type: this.section,
        isMyProfile: this.isMyProfile
      }));
    }

    this.ui[this.section].tab("show");
  },

  setSection: function(e){
    this.section = e.target.parentElement.id + 's';
    this.changeTab();
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