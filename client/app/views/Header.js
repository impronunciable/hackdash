
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
  }

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