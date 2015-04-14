/**
 * VIEW: Login Modal
 *
 */

var template = require('./templates/share.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "share",
  template: template,

  events: {
    "click .close": "destroy"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  serializeData: function(){
    return _.extend({
      settings: this.settings
    }, this.model.toJSON());
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

  settings: [{
    code: 'prg',
    name: 'Progress'
  }, {
    code: 'pic',
    name: 'Picture'
  }, {
    code: 'title',
    name: 'Title'
  }, {
    code: 'desc',
    name: 'Description'
  }, {
    code: 'contrib',
    name: 'Contributors'
  }, {
    code: 'acnbar',
    name: 'Action Bar'
  }]

});