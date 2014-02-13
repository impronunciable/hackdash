/**
 * Collection: Projectss
 *
 */

var 
  Project = require('./Project');

module.exports = Backbone.Collection.extend({

  model: Project,

  url: function(){
    return hackdash.apiURL + '/projects'; 
  },

});

