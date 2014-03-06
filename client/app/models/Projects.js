/**
 * Collection: Projectss
 *
 */

var 
  Project = require('./Project');

var Projects = module.exports = Backbone.Collection.extend({

  model: Project,

  idAttribute: "_id",
  
  url: function(){
    return hackdash.apiURL + '/projects'; 
  },

  parse: function(response){
    var projects = [];

    // only parse projects actives if no user or user not admin of dash
    _.each(response, function(project){

      if (hackdash.app.type === "dashboard"){
        var user = hackdash.user;
        var isAdmin = user && (user._id === project.leader._id || user.admin_in.indexOf(this.domain) >= 0);
        if (isAdmin || project.active){
          projects.push(project);
        }
      }
      else if (project.active) {
        projects.push(project);
      }

    });

    return projects;
  },

  buildShowcase: function(showcase){
    _.each(showcase, function(id, i){
      var found = this.where({ _id: id });
      if (found.length > 0){
        found[0].set("showcase", i);
      }
    }, this);

    this.trigger("reset");
  },

  getOnlyActives: function(){
    return new Projects(
      this.filter(function(project){
        return project.get("active");
      })
    );
  }

});

