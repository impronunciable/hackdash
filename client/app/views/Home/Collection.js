/**
 * VIEW: A Collection of HOME Search
 *
 */

var template = require('./templates/collection.hbs');
var ItemView = require('./Item.js');

var CollectionView = module.exports = ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: 'entity collection',
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  getURL: function(){
    return "/collections/" + this.model.get("_id");
  },

  onRender: function(){
    if (!this.model.get('title')){
      this.$el.addClass('hide');
    }

    CollectionView.__super__.onRender.call(this);
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

});