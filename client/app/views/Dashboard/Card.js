/**
 * VIEW: An Dashboard of HOME Search
 *
 */

var template = require('./templates/card.hbs');
var ItemView = require('../Home/Item.js');

module.exports = ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: 'entity dashboard',
  template: template,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  getURL: function(){
    return "/dashboards/" + this.model.get("domain");
  },

  afterRender: function(){
    var list = $('.list',this.$el);
    var count = this.model.get('covers').length;

    if (count === 0){
      return;
    }

    list.addClass('grid-1');
/*
    if (count >= 4){
      list.addClass('grid-4');
    }

    switch(count){
      case 1: list.addClass('grid-1'); break;
      case 2: list.addClass('grid-2'); break;
      case 3: list.addClass('grid-3'); break;
    }
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

});