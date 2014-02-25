/**
 * Collection: Users
 *
 */

var 
  User = require('./User');

module.exports = Backbone.Collection.extend({
  
  model: User,
  
  idAttribute: "_id",

  url: function(){
    return hackdash.apiURL + '/users'; 
  },

});

