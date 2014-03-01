/**
 * VIEW: ProfileCard Edit
 * 
 */
 
var template = require('./templates/cardEdit.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "boxxy",
  template: template,

  ui: {
    "name": "input[name=name]",
    "email": "input[name=email]",
    "bio": "textarea[name=bio]"
  },

  events: {
    "click #save": "saveProfile",
    "click #cancel": "cancel"
  },

  modelEvents:{
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  saveProfile: function(){
    var toSave = {};

    _.each(this.ui, function(ele, type){
      toSave[type] = ele.val();
    }, this);

    this.cleanErrors();

    $("#save", this.$el).button('loading');

    this.model
      .save(toSave, { patch: true, silent: true })
      .error(this.showError.bind(this));
  },

  cancel: function(){
    hackdash.app.router.navigate("/", { trigger: true, replace: true });
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  //TODO: move to i18n
  errors: {
    "name_required": "Name is required",
    "email_required": "Email is required",
    "email_invalid": "Invalid Email"
  },

  showError: function(err){
    $("#save", this.$el).button('reset');

    if (err.responseText === "OK"){
      return;
    }

    var error = JSON.parse(err.responseText).error;

    var ctrl = error.split("_")[0];
    this.ui[ctrl].parents('.control-group').addClass('error');
    this.ui[ctrl].after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error");
    $("span.help-inline", this.$el).remove();
  }

});