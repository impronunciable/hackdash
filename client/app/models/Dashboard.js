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
      throw new Error('Unkonw Dashboard domain name');
    }
  },

  idAttribute: "domain",

  initialize: function(){
    this.set("admins", new Admins());
    this.on('change:domain', this.setAdminDomains.bind(this));
    this.setAdminDomains();
  },

  setAdminDomains: function(){
    var admins = this.get("admins");
    admins.domain = this.get('domain');
    this.set("admins", admins);
  }

});

