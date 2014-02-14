/**
 * Collection: Projectss
 *
 */

var 
  Project = require('./Project');

module.exports = Backbone.Collection.extend({

  model: Project,

  idAttribute: "_id",
  
  url: function(){
    return hackdash.apiURL + '/projects'; 
  },

});

