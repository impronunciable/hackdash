/**
 * Collection: Collections (group of Dashboards)
 *
 */

var 
  Collection = require('./Collection');

module.exports = Backbone.Collection.extend({

  model: Collection,

  idAttribute: "_id",
  
  url: function(){
    return hackdash.apiURL + '/collections'; 
  }

});

