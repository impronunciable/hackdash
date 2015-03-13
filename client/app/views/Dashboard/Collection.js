/**
 * VIEW: Dashboards
 *
 */

var Dashboard = require('./Card');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "entities",
  childView: Dashboard,

  gutter: 5,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    var self = this;
    _.defer(function(){
      self.updateGrid();
      self.refresh();
    });

    /*
    var self = this;
    _.defer(function(){
      self.updateIsotope();
    });
    */
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

  updateGrid: function(){
    if (!this.wall){
      this.wall = new window.freewall(this.$el);
    }

    this.wall.reset({
      selector: '.entity',
      cellW: 200,
      cellH: 200,
      gutterY: this.gutter,
      gutterX: this.gutter,
      onResize: this.refresh.bind(this)
    });

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
*/
});