/**
 * MODEL: Project
 *
 */

module.exports = Backbone.Model.extend({

  url: function(){
    return hackdash.apiURL + "/"; 
  },

  idAttribute: "_id",  

});

