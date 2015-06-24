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

  events: {
    "click .logo": "stopPropagation"
  },

  templateHelpers: {
    hackdashURL: function(){
      return "//" + hackdash.baseURL;
    },
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

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  stopPropagation: function(e){
    e.stopPropagation();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  placeholders: {
    title: "Hackathon Title",
    description: "brief description of this hackathon",
    link: "url to hackathon site"
  },

  initEditables: function(){
    this.initEditable("title", '<input type="text" maxlength="30">');
    this.initEditable("description", '<textarea maxlength="250"></textarea>', 'textarea');
    this.initEditable("link");
  },

  initEditable: function(type, template, control){
    var ph = this.placeholders;
    var self = this;

    if (this.ui[type].length > 0){

      this.ui[type].editable({
        type: control || 'text',
        title: ph[type],
        emptytext: ph[type],
        placeholder: ph[type],
        tpl: template,
        success: function(response, newValue) {
          self.model.set(type, newValue);
          self.model.save();
        }
      });
    }
  },

});