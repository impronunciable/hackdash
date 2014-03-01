/**
 * VIEW: Collections
 * 
 */

var Collection = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "collection",
  className: "row collection",
  itemView: Collection,
  
  collectionEvents: {
    "remove": "render",
    "sort:date": "sortByDate",
    "sort:name": "sortByName"
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

  sortByName: function(){
    this.$el.isotope({"sortBy": "name"});
  },

  sortByDate: function(){
    this.$el.isotope({"sortBy": "date"});
  },

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
      , sortAscending: true
      , getSortData : {
          "name" : function ( $elem ) {
            return $elem.data("name").toLowerCase();
          },
          "date" : function ( $elem ) {
            return $elem.data("date");
          }
        }
      , sortBy: "name"
    });
    
    this.isotopeInitialized = true;
  }

});