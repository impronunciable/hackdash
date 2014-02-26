/**
 * MODEL: User
 *
 */

var Projects = require("./Projects");

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  defaults: {
    dashboards: null,
    projects: null,
    contributions: null,
    likes: null
  },

  urlRoot: function(){
    return hackdash.apiURL + '/profiles'; 
  },

  parse: function(response){

    response.dashboards = new Backbone.Collection(
      _.map(response.admin_in, function(dash){ return { title: dash }; })
    );
    
    response.projects = new Projects(response.projects);
    response.contributions = new Projects(response.contributions);
    response.likes = new Projects(response.likes);

    return response;
  }

});
