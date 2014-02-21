
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
    "dashboard": ".dashboard-ctn"
  },

  ui: {
    "switcher": ".dashboard-switcher input"
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

  onRender: function(){
    var isDashboard = (window.hackdash.app.type === "dashboard" ? true : false);
    
    this.search.show(new Search({
      showSort: isDashboard
    }));

    if (isDashboard){
      this.dashboard.show(new DashboardDetails({
        model: this.model
      }));
    }

    $('.tooltips', this.$el).tooltip({});
    this.initSwitcher();
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

  initSwitcher: function(){
    var self = this;

    this.ui.switcher
      .bootstrapSwitch()
      .on('switch-change', function (e, data) {
        self.model.set({ "open": data.value}, { trigger: false });
        self.model.save({ wait: true });
      });
  }

});