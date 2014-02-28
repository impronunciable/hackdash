/**
 * MODEL: Dashboards
 *
 */

module.exports = Backbone.Collection.extend({

  url: function(){
    return hackdash.apiURL + "/dashboards"; 
  },

  idAttribute: "_id", 

});

