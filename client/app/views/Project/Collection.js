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

  modelEvents:{
    "edit:showcase": "onStartEditShowcase",
    "end:showcase": "onEndEditShowcase"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------
  
  showcaseMode: false,

  onRender: function(){
    var self = this;
    _.defer(function(){
      self.updateIsotope();

      if (self.showcaseMode){
        self.startSortable();
      }
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onStartEditShowcase: function(){
    this.collection = hackdash.app.projects.getOnlyActives();
    this.showcaseMode = true;
    this.render();
  },

  onEndEditShowcase: function(){
    this.saveShowcase();
    this.collection = hackdash.app.projects;
    this.showcaseMode = false;
    this.render();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  sortByName: function(){
    this.$el.isotope({"sortBy": "name"});
  },

  sortByDate: function(){
    this.$el.isotope({"sortBy": "date"});
  },

  sortByShowcase: function(){
    this.$el.isotope({"sortBy": "showcase"});
  },

  gridSize: {
    columnWidth: 300,
    rowHeight: 220
  },

  isotopeInitialized: false,
  updateIsotope: function(sortType){
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
  },
/*
  endSortable: function(){
    var $projects = this.$el;

    this.saveShowcase();

    this.pckry.destroy();
    $projects.removeClass("showcase");

    this.updateIsotope("showcase");
  },
*/
  saveShowcase: function(){
    var itemElems = this.pckry.getItemElements();
    var showcase = [];

    for ( var i=0, len = itemElems.length; i < len; i++ ) {
      var elem = itemElems[i];
      $(elem).data('showcase', i);

      var found = this.collection.where({ _id: elem.id });
      if (found.length > 0){
        found[0].set({ "showcase": i}, { silent: true });
      }

      showcase.push(elem.id);
    }

    this.model.save({ "showcase": showcase });

    this.pckry.destroy();
    this.$el.removeClass("showcase");
    this.updateIsotope("showcase");
  }

});