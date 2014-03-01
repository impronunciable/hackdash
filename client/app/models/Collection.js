/**
 * MODEL: Collection (a group of Dashboards)
 *
 */

var Dashboards = require('./Dashboards');

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  urlRoot: function(){
    return hackdash.apiURL + '/collections'; 
  },

  parse: function(response){
    response.dashboards = new Dashboards(response.dashboards || []);
    return response;
  },

  addDashboard: function(dashId){
    $.ajax({
      url: this.url() + '/dashboards/' + dashId,
      type: "POST",
      context: this
    });

    this.get("dashboards").add({ _id: dashId });
  },

  removeDashboard: function(dashId){
    $.ajax({
      url: this.url() + '/dashboards/' + dashId,
      type: "DELETE",
      context: this
    });

    var result = this.get("dashboards").where({ _id: dashId});
    if (result.length > 0){
      this.get("dashboards").remove(result[0]);
    }
  },

});

