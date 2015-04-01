/**
 * VIEW: A collection of Items for a Home Search
 *
 */

var Item = require('./Item');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: 'entities',
  childView: Item,

  gutter: 5,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    var self = this;
    _.defer(function(){

      var p = self.$el.parents('.content');
      self.height = p.height()-((self.gutter*2)*2);

      self.updateGrid();
      self.refresh();
    });
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  refresh: function(){
    if (this.wall){
      this.wall.fitHeight(this.height);
      this.wall.refresh();
    }
  },

  moveLeft: function(){
    this.move('-=');
  },

  moveRight: function(){
    this.move('+=');
  },

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

  getCardSize: function(){
    return $('.entity:first', this.$el).outerWidth() + this.gutter;
  },

  move: function(dir){
    var move = dir + this.getCardSize();
    this.$el.animate({ scrollLeft: move }, 250);
  },

});