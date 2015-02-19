/**
 * VIEW: A Team for a Home Search
 *
 */

var User = require('./TeamUser');

module.exports = Backbone.Marionette.CollectionView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  childView: User,

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    this.collection = new Backbone.Collection([{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      },{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      },{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      },{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      },{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      },{
        _id: "54909d0f7fd3d5704c0006c6",
        name: "Alvaro Graves",
        picture: "http://www.gravatar.com/avatar/5d79ff6eb94d9754235c7bad525bee81?s=73",
        bio: "una mañana tras un sueño intranquilo Gregorio Samsa mañana tras un sueño mañana tras"
      }]);
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