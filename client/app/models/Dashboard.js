/**
 * MODEL: Project
 *
 */

var Admins = require("./Admins");

module.exports = Backbone.Model.extend({

  defaults: {
    admins: null
  },

  url: function(){
    return hackdash.apiURL + "/"; 
  },

  idAttribute: "_id", 

  initialize: function(){
    this.set("admins", new Admins());
  },

});

