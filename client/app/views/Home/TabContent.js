/**
 * VIEW: HOME Tab Layout (Search header + collection)
 *
 */

var template = require("./templates/tabContent.hbs");

// Main Views
var
    Search = require("./Search")
  , EntityList = require("./EntityList")

// Item Views
  , ProjectItemView = require('../Project/Card')
  , DashboardItemView = require('../Dashboard/Card')
  , UserItemView = require('./User')
  , CollectionView = require('./Collection')

// List Views
  , ProjectList = EntityList.extend({ childView: ProjectItemView })
  , DashboardList = EntityList.extend({ childView: DashboardItemView })
  , UserList = EntityList.extend({ childView: UserItemView })
  , CollectionList = EntityList.extend({ childView: CollectionView })

// Collection models
  , Projects = require('../../models/Projects')
  , Dashboards = require('../../models/Dashboards')
  , Collections = require('../../models/Collections')
  , Users = require('../../models/Users');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

  ui: {
    "content": '.content',
    "arrows": '.arrow'
  },

  events: {
    "click .arrow-left": "moveLeft",
    "click .arrow-right": "moveRight"
  },

  regions: {
    "header": ".header",
    "content": ".content"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    if (!this.refresher){
      this.refresher = this.refreshContent.bind(this);
    }

    this.collection
      .off('reset', this.refresher)
      .on('reset', this.refresher);
  },

  refreshContent: function(){
    if (this.content && this.content.currentView){
      this.content.currentView.refresh();
    }
  },

  onRender: function(){

    if (!this.header.currentView){

      this.header.show(new Search({
        collection: this.collection
      }));

      var ListView;
      if(this.collection instanceof Projects){
        ListView = ProjectList;
      }
      else if(this.collection instanceof Dashboards){
        ListView = DashboardList;
      }
      else if(this.collection instanceof Collections){
        ListView = CollectionList;
      }
      else if(this.collection instanceof Users){
        ListView = UserList;
      }

      this.content.show(new ListView({
        collection: this.collection
      }));

      var h = $(window).height() - 200;
      h = ( h < 420 ) ? 420 : h;

      var w = $(window).width() - 150;

      this.ui.content.width(w).height(h);
      this.ui.arrows.css('top', ((h/2) - this.ui.arrows.eq(0).height()/2) + "px");
    }

  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  moveLeft: function(){
   this.content.currentView.moveLeft();
  },

  moveRight: function(){
   this.content.currentView.moveRight();
  },


  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

});