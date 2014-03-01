/**
 * VIEW: Dashboards
 * 
 */

var Dashboard = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "dashboards",
  className: "row dashboards",
  itemView: Dashboard,
  
  itemViewOptions: function(){
    return {
      hideAdd: this.hideAdd
    };
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  initialize: function(options){
    this.hideAdd = (options && options.hideAdd) || false;
  },

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