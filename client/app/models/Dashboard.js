/**
 * MODEL: Project
 *
 */

var Admins = require("./Admins");

module.exports = Backbone.Model.extend({

  defaults: {
    admins: null
  },

  urlRoot: function(){
    return hackdash.apiURL + '/dashboards'; 
  },

  idAttribute: "domain", 

  initialize: function(){
    this.set("admins", new Admins());
  },

});

