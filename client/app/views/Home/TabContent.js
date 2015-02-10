/**
 * VIEW: HOME Tab Layout (Search header + collection)
 *
 */

var template = require("./templates/tabContent.hbs");

var Search = require("./Search");
var EntityList = require("./EntityList");

var ProjectItemView = require('./Project');
var DashboardItemView = require('./Dashboard');
var ItemView = require('./Item');

var ProjectList = EntityList.extend({ childView: ProjectItemView });
var DashboardList = EntityList.extend({ childView: DashboardItemView });
var UserList = EntityList.extend({ childView: ItemView });
var CollectionList = EntityList.extend({ childView: ItemView });

var Projects = require('../../models/Projects');
var Dashboards = require('../../models/Dashboards');
var Collections = require('../../models/Collections');
var Users = require('../../models/Users');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  template: template,

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