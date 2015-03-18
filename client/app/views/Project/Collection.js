/**
 * VIEW: Projects of an Instance
 *
 */

var Project = require('./Card');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "entities",
  childView: Project,

  collectionEvents: {
    "remove": "render",
    "sort:date": "sortByDate",
    "sort:name": "sortByName",
    "sort:showcase": "sortByShowcase"
  },

  gutter: 5,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.showcaseMode = (options && options.showcaseMode) || false;
    this.showcaseSort = (options && options.showcaseSort) || false;

    //window.showSort = this.updateShowcaseOrder.bind(this);
  },

  onRender: function(){
    _.defer(this.onEndRender.bind(this));
  },

  onEndRender: function(){
    this.updateGrid();
    this.refresh();
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  updateShowcaseOrder: function(){
    var showcase = [];

    $('.entity', this.$el).sort(function (a, b) {

      var av = ( isNaN(+a.dataset.showcase) ? +a.dataset.delay : +a.dataset.showcase +1);
      var bv = ( isNaN(+b.dataset.showcase) ? +b.dataset.delay : +b.dataset.showcase +1);

      return av - bv;
    }).each(function(i, e){
      console.log (i + ' > ' + e.dataset.name);
    });


    return showcase;
  },

/*
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
*/
  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  sortByName: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-name') > $(b).attr('data-name');
    }).filter('*');

    this.fixSize();
  },

  sortByDate: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-date') < $(b).attr('data-date');
    }).filter('*');

    this.fixSize();
  },

  sortByShowcase: function(){
    this.wall.sortBy(function(a, b) {
      return $(a).attr('data-showcase') - $(b).attr('data-showcase');
    }).filter('.filter-active');

    this.fixSize();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  updateGrid: function(){
    var self = this;

    if (!this.wall){
      this.wall = new window.freewall(this.$el);
    }

    this.wall.reset({
      draggable: this.showcaseMode,
      keepOrder: false,
      selector: '.entity',
      cellW: 200,
      cellH: 200,
      gutterY: this.gutter,
      gutterX: this.gutter,
      onResize: this.refresh.bind(this),
      onComplete: function(/*lastItem, lastBlock, setting*/) { },
      onBlockDrop: function() {

        var cols = self.$el.attr('data-total-col');
        var pos = $(this).attr('data-position');
        var ps = pos.split('-');

        var row = parseInt(ps[0],10);
        var showcase = ((row*cols) + parseInt(ps[1],10));

        $(this).attr('data-showcase', showcase+1);
        console.log(showcase+1);
        self.model.isDirty = true;

        self.updateShowcaseOrder();
      }
    });

    if (this.showcaseMode){
      this.$el.addClass("showcase");
      this.sortByShowcase();
      return;
    }

    this.sortByDate();

  },

  refresh: function(){
    this.wall.fitWidth();
    this.wall.refresh();
    this.fixSize();
  },

  fixSize: function(){
    this.$el.height(this.$el.height() + this.gutter*4);
  },

/*
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
            var name = $($elem).data("name");
            return name && name.toLowerCase() || "";
          },
          "date" : function ( $elem ) {
            return $($elem).data("date");
          },
          "showcase" : function ( $elem ) {
            var showcase = $($elem).data("showcase");
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
*/
});