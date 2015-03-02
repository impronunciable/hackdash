
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

    "collectionsLen": ".coll-length",
    "dashboardsLen": ".dash-length",
    "projectsLen": ".proj-length",
    "contributionsLen": ".contrib-length",
    "likesLen": ".likes-length"
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

    if (hackdash.user && this.model.get("_id") === hackdash.user._id){
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

    this.model.get("collections").on("reset", this.updateCount.bind(this, "collections"));
    this.model.get("dashboards").on("reset", this.updateCount.bind(this, "dashboards"));
    this.model.get("projects").on("reset", this.updateCount.bind(this, "projects"));
    this.model.get("contributions").on("reset", this.updateCount.bind(this, "contributions"));
    this.model.get("likes").on("reset", this.updateCount.bind(this, "likes"));

    $('a[data-toggle="tab"]', this.$el).on('shown.bs.tab', this.setSection.bind(this));
  },

  changeTab: function(){
    if (!this[this.section].currentView){
      var coll = new Backbone.Collection(this.model.get(this.section));
      if (this.section === "dashboards"){
        coll = this.model.get(this.section);
      }

      this[this.section].show(new EntityList({
        collection: coll,
        type: this.section
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

  updateCount: function(which){
    this.ui[which + "Len"].text(this.model.get(which).length);
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});