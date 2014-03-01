
var 
    template = require('./templates/footer.hbs')
  , Users = require('./Users');

module.exports = Backbone.Marionette.Layout.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "container",
  template: template,

  regions: {
    "admins": ".admins-ctn"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    var isDashboard = (hackdash.app.type === "dashboard" ? true : false);
    
    if (isDashboard){

      this.admins.show(new Users({
        collection: this.model.get("admins")
      }));

      this.model.get("admins").fetch();
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


});