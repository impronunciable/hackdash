/**
 * VIEW: Profile Item List
 *
 */

var template = require('./templates/listItem.hbs'),
  Dashboard = require('../../models/Dashboard');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  tagName: "li",
  template: template,

  events: {
    "click .remove-entity": "removeEntity"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(options){
    this.type = (options && options.type) || "projects";
    this.isMyProfile = (options && options.isMyProfile) || false;
  },

  serializeData: function(){
    var url,
      isProject = false,
      showDelete = false;

    switch(this.type){
      case "collections":
        url = "/collections/" + this.model.get("_id");
        break;
      case "dashboards":
        url = "/dashboards/" + this.model.get("domain");
        showDelete = this.isMyProfile && Dashboard.isAdmin(this.model);
        break;
      case "projects":
      case "contributions":
      case "likes":
        url = "/projects/" + this.model.get("_id");
        isProject = true;
        break;
    }

    var showImage = (this.type === "collections" || this.type === "dashboards" ? false : true);
    if (showImage){
      showImage = this.model.get('cover');
    }

    return _.extend({
      showImage: showImage,
      isProject: isProject,
      showDelete: showDelete,
      type: this.type,
      url: url
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  removeEntity: function(e){
    if (this.type !== "dashboards"){
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (!Dashboard.isAdmin(this.model)){
      this.showMessage("Only the Owner can remove this Dashboard.");
      return;
    }

    if (!Dashboard.isOwner(this.model)){
      this.showMessage("Only Dashboards with ONE admin can be removed.");
      return;
    }

    if (this.model.get("projectsCount") > 0){
      this.showMessage("Only Dashboards without Projects can be removed.");
      return;
    }

    if (window.confirm('This action will remove Dashboard ' +
      this.model.get("domain") + '. Are you sure?')){

        var dash = new Dashboard({ domain: this.model.get('domain') });
        dash.destroy().done(function(){
          window.location.reload();
        });
    }
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  showMessage: function(msg){
    hackdash.app.showOKMessage({
      title: "Cannot Remove " + this.model.get('domain') + " Dashboard",
      message: msg,
      type: "danger"
    });
  }

});