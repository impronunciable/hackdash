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
    if (this.domain){
      return hackdash.apiURL + '/' + this.domain + '/projects';   
    }
    return hackdash.apiURL + '/projects'; 
  },

  parse: function(response){

    if (hackdash.app.type !== "dashboard"){
      //it is not a dashboard so all projects active
      return response;
    }

    var dashboard = hackdash.app.dashboard;

    var showcase = (dashboard && dashboard.get("showcase")) || [];
    if (showcase.length === 0){
      //no showcase defined: all projects are active
      return response;
    }

    // set active property of a project from showcase mode 
    // (only projects at showcase array are active ones)
    _.each(response, function(project){
      
      if (showcase.indexOf(project._id) >= 0){
        project.active = true;
      }
      else {
        project.active = false; 
      }

    });

    return response;
  },

  buildShowcase: function(showcase){
    _.each(showcase, function(id, i){
      var found = this.where({ _id: id, active: true });
      if (found.length > 0){
        found[0].set("showcase", i);
      }
    }, this);

    this.trigger("reset");
  },

  getActives: function(){
    return new Projects(
      this.filter(function(project){
        return project.get("active");
      })
    );
  },

  getInactives: function(){
    return new Projects(
      this.filter(function(project){
        return !project.get("active");
      })
    );
  }

});

