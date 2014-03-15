
var 
    template = require('./templates/footer.hbs')
  , Users = require('./Users')
  , Embed = require('./Embed');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container",
  template: template,

  regions: {
    "admins": ".admins-ctn"
  },

  ui: {
    "switcher": ".dashboard-btn",
    "showcaseMode": ".btn-showcase-mode",
    "createShowcase": ".btn-new-project",
    "footerToggle": ".footer-toggle-ctn"
  },

  events: {
    "click .dashboard-btn": "onClickSwitcher",
    "click .embed-btn": "showEmbedModal",
    "click .btn-showcase-mode": "changeShowcaseMode"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);

    if (isDashboard){
      this.model.get("admins").fetch();
    } 
  },

  onRender: function(){
    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);
    
    if (isDashboard){
      this.admins.show(new Users({
        model: this.model,
        collection: this.model.get("admins")
      }));
    }

    $('.tooltips', this.$el).tooltip({});
  },

  serializeData: function(){
    var msg = "This Dashboard is open: click to close";

    if (!this.model.get("open")) {
      msg = "This Dashboard is closed: click to reopen";
    }

    return _.extend({
      switcherMsg: msg
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onClickSwitcher:function(){
    var open = true;

    if (this.ui.switcher.hasClass("dash-open")){
      open = false;
    }
    
    $('.tooltips', this.$el).tooltip('hide');

    this.model.set({ "open": open }, { trigger: false });
    this.model.save({ wait: true });
  },

  showEmbedModal: function(){
    hackdash.app.modals.show(new Embed());
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  changeShowcaseMode: function(){
    if (this.ui.showcaseMode.hasClass("on")){

      this.model.trigger("save:showcase");
      this.model.trigger("end:showcase");
      
      this.model.isShowcaseMode = false;
    
      this.ui.showcaseMode
        .text("Edit Showcase")
        .removeClass("on");

      this.ui.createShowcase.removeClass("hide");
      this.ui.footerToggle.removeClass("hide");
    }
    else {
      this.model.isShowcaseMode = true;
      this.model.trigger("edit:showcase");

      this.ui.showcaseMode
        .text("Save Showcase")
        .addClass("on");

      this.ui.createShowcase.addClass("hide");
      this.ui.footerToggle.addClass("hide");
    }
  }

});