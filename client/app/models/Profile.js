/**
 * MODEL: User
 *
 */

var Projects = require("./Projects");

module.exports = Backbone.Model.extend({

  idAttribute: "_id",

  defaults: {
    collections: new Backbone.Collection(),
    dashboards: new Backbone.Collection(),
    projects: new Projects(),
    contributions: new Projects(),
    likes: new Projects()
  },

  urlRoot: function(){
    return hackdash.apiURL + '/profiles'; 
  },

  parse: function(response){

    this.get("collections").reset(response.collections);

    this.get("dashboards").reset( 
      _.map(response.admin_in, function(dash){ return { title: dash }; })
    );
    
    this.get("projects").reset(response.projects);
    this.get("contributions").reset(response.contributions);
    this.get("likes").reset(response.likes);
    
    return response;
  }

});
