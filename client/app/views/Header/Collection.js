/**
 * VIEW: CollectionHeader Layout
 * 
 */

var 
    template = require('./templates/collection.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "title": "#collection-title",
    "description": "#collection-description"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return (user && this.owner._id === user._id) || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var user = hackdash.user;

    if (user){
      var isAdmin = this.model.get("owner")._id === user._id;
      
      if (isAdmin){
        this.initEditables();
      }
    }

    $('.tooltips', this.$el).tooltip({});
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

  initEditables: function(){
    var self = this;

    this.ui.title.editable({
      type: 'text',
      title: 'Enter title',
      emptytext: "Enter a title",
      inputclass: 'dashboard-edit-title',
      tpl: '<input type="text" maxlength="30">',

      success: function(response, newValue) {
        self.model.set('title', newValue);
        self.model.save();
      }
    });

    this.ui.description.editable({
      type: 'textarea',
      title: 'Enter description',
      emptytext: "Enter a description",
      inputclass: "dashboard-edit-desc",
      tpl: '<textarea maxlength="250" cols="50"></textarea>',

      success: function(response, newValue) {
        self.model.set('description', newValue);
        self.model.save();
      }
    });
  },

});