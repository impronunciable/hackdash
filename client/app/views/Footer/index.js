
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
    "switcher": ".dashboard-btn"
  },

  events: {
    "click .dashboard-btn": "onClickSwitcher",
    "click .embed-btn": "showEmbedModal"
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
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------


});