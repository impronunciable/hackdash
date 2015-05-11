/**
 * VIEW: Profile list (collection, dashboard, project)
 *
 */

var Item = require('./ListItem');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "ul",
  childView: Item,

  childViewOptions: function() {
    return {
      type: this.type,
      isMyProfile: this.isMyProfile
    };
  },

  showAll: true,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.fullList = options.collection || new Backbone.Collection();
    this.type = (options && options.type) || false;
    this.isMyProfile = (options && options.isMyProfile) || false;
  },

  onBeforeRender: function(){
    if (Array.isArray(this.fullList)){
      this.fullList = new Backbone.Collection(this.fullList);
    }

    this.collection = this.fullList;
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