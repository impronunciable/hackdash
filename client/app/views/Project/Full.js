/**
 * VIEW: Full Project view
 *
 */

var template = require("./templates/full.hbs")
  , Sharer = require("../Sharer");

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  id: function(){
    return this.model.get("_id");
  },

  className: "page-ctn project",
  template: template,

  templateHelpers: {
    showActions: function(){
      if (hackdash.user && this.leader){
        return hackdash.user._id !== this.leader._id;
      }
      return false;
    },
    isAdminOrLeader: function(){
      var user = hackdash.user;
      if (this.leader && user){
        return user._id === this.leader._id || user.admin_in.indexOf(this.domain) >= 0;
      }
      return false;
    }
  },

  ui: {
    "contribute": ".contributor a",
    "follow": ".follower a",
    "shareLink": '.share'
  },

  events: {
    "click @ui.contribute": "onContribute",
    "click @ui.follow": "onFollow",
    "click .remove a": "onRemove",
    "click .login": "showLogin",
    "click .share": "showShare",
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.$el.addClass(this.model.get("status"));
    $(".tooltips", this.$el).tooltip({});
    if (hackdash.discourseUrl) {
      $.getScript("/js/discourse.js");
    }
    if (hackdash.disqus_shortname) {
      $.getScript("/js/disqus.js");
    }

    $('html, body').scrollTop(0);
  },

  serializeData: function(){
    return _.extend({
      contributing: this.model.isContributor(),
      following: this.model.isFollower()
    }, this.model.toJSON());
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  onContribute: function(e){
    this.ui.contribute.button('loading');
    this.model.toggleContribute();
    e.preventDefault();
  },

  onFollow: function(e){
    this.ui.follow.button('loading');
    this.model.toggleFollow();
    e.preventDefault();
  },

  onRemove: function(){
    if (window.confirm(__("This project is going to be deleted. Are you sure?"))){
      var domain = this.model.get('domain');
      this.model.destroy();

      hackdash.app.router.navigate("/dashboards/" + domain, {
        trigger: true,
        replace: true
      });
    }
  },

  showLogin: function(){
    hackdash.app.showLogin();
  },

  showShare: function(e){
    var el = $(e.target);
    Sharer.show(el, {
      type: 'project',
      model: this.model
    });
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});