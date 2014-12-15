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
    "sort:name": "sortByName",
    "sort:showcase": "sortByShowcase"
  },

  gridSize: {
    columnWidth: 300,
    rowHeight: 220
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  initialize: function(options){
    this.showcaseMode = (options && options.showcaseMode) || false;
    this.showcaseSort = (options && options.showcaseSort) || false;
  },

  onRender: function(){

    var self = this;
    _.defer(function(){
      if (self.showcaseSort) {
        self.updateIsotope("showcase", ".filter-active");
      }
      else {
        self.updateIsotope();
      }

      if (self.showcaseMode){
        self.startSortable();
      }
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  updateShowcaseOrder: function(){
    var itemElems = this.pckry.getItemElements();
    var showcase = [];

    for ( var i=0, len = itemElems.length; i < len; i++ ) {
      var elem = itemElems[i];
      $(elem).data('showcase', i);

      var found = this.collection.where({ _id: elem.id, active: true });
      if (found.length > 0){
        found[0].set({ 
          "showcase": i
        }, { silent: true });
      }

      showcase.push(elem.id);
    }

    this.pckry.destroy();

    return showcase;
  },

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  sortByName: function(){
    this.$el
      .isotope({"filter": ""})
      .isotope({"sortBy": "name"});
  },

  sortByDate: function(){
    this.$el
      .isotope({"filter": ""})
      .isotope({"sortBy": "date"});
  },

  sortByShowcase: function(){
    this.$el
      .isotope({"filter": ".filter-active"})
      .isotope({"sortBy": "showcase"});
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isotopeInitialized: false,
  updateIsotope: function(sortType, filterType){
    var $projects = this.$el;

    if (this.isotopeInitialized){
      $projects.isotope("destroy");
    }

    $projects.isotope({
        itemSelector: ".project"
      , animationEngine: "jquery"
      , resizable: true
      , sortAscending: true
      , cellsByColumn: this.gridSize
      , getSortData : {
          "name" : function ( $elem ) {
            var name = $elem.data("name");
            return name && name.toLowerCase() || "";
          },
          "date" : function ( $elem ) {
            return $elem.data("date");
          },
          "showcase" : function ( $elem ) {
            var showcase = $elem.data("showcase");
            return (showcase && window.parseInt(showcase)) || 0;
          },
        }
      , sortBy: sortType || "name"
      , filter: filterType || ""
    });
    
    this.isotopeInitialized = true;
  },

  startSortable: function(){
    var $projects = this.$el;

    $projects.addClass("showcase");
    this.sortByShowcase();

    if (this.pckry){
      this.pckry.destroy();
    }

    this.pckry = new Packery( $projects[0], this.gridSize); 

    var itemElems = this.pckry.getItemElements();

    for ( var i=0, len = itemElems.length; i < len; i++ ) {
      var elem = itemElems[i];
      var draggie = new Draggabilly( elem );
      this.pckry.bindDraggabillyEvents( draggie );
    }

    var self = this;
    this.pckry.on( 'dragItemPositioned', function() { 
      self.model.isDirty = true;
    });
  }

});