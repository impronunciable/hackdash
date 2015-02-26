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
  , ProjectItemView = require('./Project')
  , DashboardItemView = require('./Dashboard')
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
    "content": '.content'
  },

  regions: {
    "header": ".header",
    "content": ".content"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

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

      this.ui.content.height($(window).height() - 200);
    }

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