
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var cache_manager = require('cache-manager');

var database;

module.exports = function(config){

  var mongoUri = config.MONGO_URI || 'mongodb://localhost/prerender';
  var interval = config.INTERVAL_DAYS || 15;

  MongoClient.connect(mongoUri, function(err, db) {
    database = db;
  });

  return {

    init: function() {
      this.cache = cache_manager.caching({
        store: mongo_cache
      });
    },

    beforePhantomRequest: function(req, res, next) {
      if(req.method !== 'GET') {
        return next();
      }

      var cache = this.cache;

      cache.get(req.url, function (err, result) {
        if (!err && result) {

          var date = new Date();
          date.setDate(date.getDate() - interval);

          if (result.created <= date){
            return cache.del(req.url, function(err){ next(); });
          }

          return res.send(200, result);
        }
        
        next();
      });
    },

    afterPhantomRequest: function(req, res, next) {
      this.cache.set(req.url, req.prerender.documentHTML, function(){
        next();
      });
    }

  };
};

var mongo_cache = {
  get: function(key, callback) {

    database.collection('pages', function(err, collection) {

      collection.findOne({ key: key }, function (err, item) {
        callback && callback(err, item);
      });

    });
  },
  set: function(key, value, callback) {

    database.collection('pages', function(err, collection) {
      if (err) { 
        console.log(err); 
        return callback(err);
      }

      collection.insert({ 
        key: key, 
        value: value, 
        created: new Date() 
      }, function(err){
        callback && callback(err);
      });

    });
  },
  del: function(key, callback) {

    database.collection('pages', function(err, collection) {
      collection.remove({ key: key }, function(err){
        callback && callback(err);
      });
    });
  }
};
