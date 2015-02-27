/**
 * VIEW: Projects of an Instance
 *
 */

var Project = require('./ListItem');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "ul",
  childView: Project,

  childViewOptions: function() {
    return {
      type: this.type
    };
  },

  showAll: true,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.fullList = options.collection;
    this.type = (options && options.type) || false;
  },

  onBeforeRender: function(){
    if (this.fullList.length > 5){
      if (Array.isArray(this.fullList)){
        this.fullList = new Backbone.Collection(this.fullList);
      }

      if (this.showAll) {
        this.collection = this.fullList;
      }
      else {
        this.collection = new Backbone.Collection(this.fullList.first(5));
      }
    }
  },

  onRender: function(){
    $(".show-more", this.$el).add(".show-less", this.$el).remove();

    if (this.fullList.length > 5){
      var li;
      if (this.showAll){
        li = $('<li class="show-less">Show less</li>');
        li.on("click", this.toggleAll.bind(this));
      }
      else {
        li = $('<li class="show-more">Show more</li>');
        li.on("click", this.toggleAll.bind(this));
      }

      this.$el.append(li);
    }
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  toggleAll: function(){
    this.showAll = !this.showAll;
    this.render();
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});