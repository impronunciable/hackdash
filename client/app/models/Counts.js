
module.exports = Backbone.Model.extend({

  defaults: {
    dashboards: 0,
    projects: 0,
    users: 0,
    collections: 0,
    releases: 0
  },

  urlRoot: '/counts',

});
