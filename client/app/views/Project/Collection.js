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
      showcase.push(e.dataset.id);
    });

    return showcase;
  },

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
      animate: true,
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
        self.model.isDirty = true;
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

});