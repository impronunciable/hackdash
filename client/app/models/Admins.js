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

  addAdmin: function(userId){
    $.ajax({
      url: this.url() + '/' + userId,
      type: "POST",
      context: this
    }).done(function(user){
      this.add(user);
    });
  },

});

