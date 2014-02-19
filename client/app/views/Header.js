
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
    this.search.show(new Search({
      showSort: true
    }));

    this.dashboard.show(new DashboardDetails({
      model: new Backbone.Model({

      })
    }));
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