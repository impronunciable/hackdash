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

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onBeforeRender: function(){
    if (this.initialized && !this.$el.is(':empty')){
      this.destroySlick();
      this.$el.empty();
    }
  },

  onRender: function(){
    var self = this;
    _.defer(function(){
      self.updateGrid();
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

  initialized: false,
  destroyed: false,

  destroySlick: function(){
    this.$el.slick('unslick');

    var slick = this.$el.slick('getSlick');
    slick.$list.remove();
    slick.destroy();

    this.destroyed = true;
  },

  updateGrid: function(){

    if (this.initialized && !this.destroyed){
      this.destroySlick();
    }

    if (this.$el.is(':empty')){
      this.initialized = false;
      return;
    }

    var breakpoints = [1450, 1200, 1024, 750, 430];
    var cols = 5;

    var responsive = _.map(breakpoints, function(value){
      return {
        breakpoint: value,
        settings: {
          slidesToShow: cols,
          slidesToScroll: cols--
        }
      };
    });

    this.$el.slick({
      dots: false,
      autoplay: false,
      infinite: false,
      adaptiveHeight: true,
      speed: 300,
      slidesToShow: 6,
      slidesToScroll: 6,
      responsive: responsive
    });

    this.$el
      .off('setPosition')
      .on('setPosition', this.replaceIcons.bind(this));

    this.replaceIcons();

    this.initialized = true;
    this.destroyed = false;
  },

  replaceIcons: function(){
    $('.slick-prev', this.$el).html('<i class="fa fa-chevron-left"></i>');
    $('.slick-next', this.$el).html('<i class="fa fa-chevron-right"></i>');
  }

});