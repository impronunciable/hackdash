/**
 * Collection: Collections (group of Dashboards)
 *
 */

var
  Collection = require('./Collection'),
  BaseCollection = require('./BaseCollection');

module.exports = BaseCollection.extend({

  model: Collection,

  idAttribute: "_id",

  url: function(){
    return hackdash.apiURL + '/collections';
  },

  parse: function(response){
    var whiteList = [];

    response.forEach(function(coll){
      if (coll.title && coll.dashboards.length > 0){
        whiteList.push(coll);
      }
    });

    return whiteList;
  },

  getMines: function(){
    $.ajax({
      url: this.url() + '/own',
      context: this
    }).done(function(collections){
      this.reset(collections, { parse: true });
    });
  }

});

