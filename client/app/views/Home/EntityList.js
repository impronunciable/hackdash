/**
 * VIEW: A collection of Items for a Home Search
 *
 */

var Item = require('./Item');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  childView: Item,

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
    var $items = this.$el;

    if (this.isotopeInitialized){
      $items.isotope("destroy");
    }

    $items.isotope({
        /*itemSelector: ".project"
      , */animationEngine: "jquery"
      , resizable: false
      , sortAscending: true
      , layoutMode: 'fitRows'
    });

    this.isotopeInitialized = true;
  },

});