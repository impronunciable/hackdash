/**
 * VIEW: A collection of Items for a Home Search
 *
 */

//var Item = require('./Item');
var Project = require('./Project');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  //childView: Item,
  //className: 'container-fluid',
  childView: Project,

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
  updateIsotope: function(/*sortType, filterType*/){
    var $items = this.$el;

    if (this.isotopeInitialized){
      $items.isotope("destroy");
    }

    $items.isotope({
        itemSelector: ".project"
      , animationEngine: "jquery"
      , resizable: false
      , sortAscending: true
      , layoutMode: 'fitRows'
      /*
      , getSortData : {
          "name" : function ( $elem ) {
            var name = $($elem).data("name");
            return name && name.toLowerCase() || "";
          },
          "date" : function ( $elem ) {
            return $($elem).data("date");
          },
        }
      , sortBy: sortType || "name"
      , filter: filterType || ""
      */
    });

    this.isotopeInitialized = true;
  },

});