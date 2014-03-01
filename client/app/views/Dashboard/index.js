/**
 * VIEW: Dashboard
 * 
 */
 
var template = require('./templates/dashboard.hbs')
  , UserCollectionsView = require('../Collection/List');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "dashboard span4",
  template: template,

  events: {
    "click .demo a": "stopPropagation",
    "click .add a": "onAddToCollection"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.hideAdd = (options && options.hideAdd) || false;
  },

  onRender: function(){
    this.$el
      .attr({
          "title": this.model.get("status")
        , "data-name": this.model.get("domain")
        , "data-date": this.model.get("created_at")
      })
      .tooltip({});

    $('.tooltips', this.$el).tooltip({});

    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL;

    this.$el.on("click", function(e){
      if (!$(e.target).hasClass("add")){
        window.location = url;
      }
    });
  },

  serializeData: function(){
    return _.extend({
      hideAdd: this.hideAdd
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  stopPropagation: function(e){
    e.stopPropagation();
  },

  onAddToCollection: function(){
    hackdash.app.modals.show(new UserCollectionsView({
      model: this.model,
      collection: hackdash.app.collections
    }));
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});