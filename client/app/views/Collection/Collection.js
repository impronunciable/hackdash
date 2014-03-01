/**
 * VIEW: Collections
 * 
 */

var Collection = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "collections",
  className: "row collections",
  itemView: Collection,
  
  collectionEvents: {
    "remove": "render"
  },

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
    var $collections = this.$el;

    if (this.isotopeInitialized){
      $collections.isotope("destroy");
    }

    $collections.isotope({
        itemSelector: ".collection"
      , animationEngine: "jquery"
      , resizable: true
    });
    
    this.isotopeInitialized = true;
  }

});