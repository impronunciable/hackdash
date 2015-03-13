/**
 * VIEW: Collection Dashboards Layout
 *
 */

var template = require('./templates/index.hbs')
  , CollectionView = require('./Collection')
  , DashboardsView = require('../Dashboard/Collection');

module.exports = Backbone.Marionette.LayoutView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "page-ctn collection",
  template: template,

  regions: {
    "collection": ".coll-details",
    "dashboards": "#collection-dashboards"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onRender: function(){

    this.collection.show(new CollectionView({
      model: this.model
    }));

    this.dashboards.show(new DashboardsView({
      model: this.model,
      collection: this.model.get('dashboards')
    }));

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