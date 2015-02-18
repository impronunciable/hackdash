
var template = require("./templates/stats.hbs")
  , CountsView = require("./Counts")
  , FeedView = require("./Feed");

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "stats",
  template: template,

  regions:{
    "counts": ".counts-ctn",
    "feed": ".feed-ctn"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){
    this.counts.show(new CountsView());

    this.feed.show(

      new FeedView({

        collection: new Backbone.Collection(
          [{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          },{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          },{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          },{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          },{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          },{
            user: {
              _id: "54909d0f7fd3d5704c0006c6",
              name: "Alvaro Graves",
              picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73"
            },
            title: "Is now a collaborator on:",
            description: "una mañana tras un sueño intranquilo Gregorio Samsa",
            created_at: "2014-12-16T20:58:55.225Z"
          }])

      })
    );
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});