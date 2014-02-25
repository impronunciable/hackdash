/**
 * Collection: Administrators of a Dashboard
 *
 */

var 
  Users = require('./Users'),
  User = require('./User');

module.exports = Users.extend({
  
  model: User,
  idAttribute: "_id",

  url: function(){
    return hackdash.apiURL + '/admins'; 
  },

});

