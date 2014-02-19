/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/project.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },
  className: "project tooltips span4",
  template: template,

  events: {
    "click .contributor a": "onContribute",
    "click .follower a": "onFollow",
    "click .remove a": "onRemove"
  },

  templateHelpers: {
    instanceURL: function(){
      return "http://" + this.domain + "." + hackdash.baseURL;
    },
    showActions: function(){
      return hackdash.user._id !== this.leader;
    },
    isAdminOrLeader: function(){
      var user = hackdash.user;
      return user._id === this.leader || user.admin_in.indexOf(this.domain) >= 0;
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el
      .addClass(this.model.get("status"))
      .attr({
          "title": this.model.get("status")
        , "data-name": this.model.get("title")
        , "data-date": this.model.get("created_at")
      })
      .tooltip({});

    $('.tooltips', this.$el).tooltip({});

    var url = "http://" + this.model.get("domain") + "." + hackdash.baseURL + 
      "/p/" + this.model.get("_id");

    this.$el.on("click", function(){
      window.location = url;
    });
  },

  serializeData: function(){
    return _.extend({
      contributing: this.isContributor(),
      following: this.isFollower()
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onContribute: function(e){
    if (this.isContributor()){
      this.model.leave();
    }
    else {
      this.model.join();
    }

    e.stopPropagation();
  },

  onFollow: function(e){
    if (this.isFollower()){
      this.model.unfollow();
    }
    else {
      this.model.follow();
    }

    e.stopPropagation();
  },

  onRemove: function(e){
    if (window.confirm("This project is going to be deleted. Are you sure?")){
      this.model.destroy();
    }

    e.stopPropagation();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  isContributor: function(){
    return this.userExist(this.model.get("contributors"));
  },

  isFollower: function(){
    return this.userExist(this.model.get("followers"));
  },

  userExist: function(arr){

    if (!hackdash.user){
      return false;
    }

    var uid = hackdash.user._id;
    return _.find(arr, function(usr){
      return (usr._id === uid);
    }) ? true : false;
  }

});