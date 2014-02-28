/**
 * VIEW: Dashboards
 * 
 */

var Dashboard = require('./Dashboard');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "dashboards",
  className: "row dashboards",
  itemView: Dashboard,
  
  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  onRender: function(){
    var self = this;
    _.defer(function(){
      self.updateIsotope();
    });
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

  isotopeInitialized: false,
  updateIsotope: function(){
    var $dashboards = this.$el;

    if (this.isotopeInitialized){
      $dashboards.isotope("destroy");
    }

    $dashboards.isotope({
        itemSelector: ".dashboard"
      , animationEngine: "jquery"
      , resizable: true
    });
    
    this.isotopeInitialized = true;
  }

});