/**
 * VIEW: DashboardHeader Layout
 * 
 */

var 
    template = require('./templates/dashboard.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "title": "#dashboard-title",
    "description": "#dashboard-description",
    "link": "#dashboard-link"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.readOnly = (options && options.readOnly) || false;
  },

  onRender: function(){
    var user = hackdash.user;

    if (user){
      var isAdmin = user.admin_in.indexOf(this.model.get("domain")) >= 0;
      
      if (isAdmin){
        this.initEditables();
      }
    }

    $('.tooltips', this.$el).tooltip({});
  },

  serializeData: function(){
    return _.extend({
      readOnly: this.readOnly
    }, this.model.toJSON() || {});
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

    this.ui.link.editable({
      type: 'text',
      title: 'Enter a link',
      emptytext: "Enter a link",
      inputclass: "dashboard-edit-link",

      success: function(response, newValue) {
        self.model.set('link', newValue);
        self.model.save();
      }
    });
  },

});