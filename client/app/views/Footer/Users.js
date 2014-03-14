/**
 * VIEW: Collection of Users
 * 
 */

var template = require('./templates/users.hbs')
  , User = require('./User')
  , AddAdmin = require('./AddAdmin');

module.exports = Backbone.Marionette.CompositeView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,
  
  tagName: "div",
  itemViewContainer: "ul",
  itemView: User,
  
  events: {
    "click a.add-admins": "showAddAdmins"
  },

  templateHelpers: {
    isAdmin: function(){
      var user = hackdash.user;
      return user && user.admin_in.indexOf(this.domain) >= 0 || false;
    }
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

  showAddAdmins: function(){
    hackdash.app.modals.show(new AddAdmin({
      collection: this.collection
    }));
  }

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});