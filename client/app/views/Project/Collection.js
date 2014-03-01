/**
 * VIEW: Projects of an Instance
 * 
 */

var Project = require('./index');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: "projects",
  className: "row projects",
  itemView: Project,
  
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
    var $projects = this.$el;

    if (this.isotopeInitialized){
      $projects.isotope("destroy");
    }

    $projects.isotope({
        itemSelector: ".project"
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