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
    if (this.get('domain')){
      return hackdash.apiURL + '/dashboards'; 
    }
    else {
      return hackdash.apiURL + '/';
    }
  },

  idAttribute: "domain", 

  initialize: function(){
    this.set("admins", new Admins());
  },

});

