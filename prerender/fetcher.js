
var request = require('request');
var async = require('async');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var database;

module.exports = function(config, ready){
  var mongoUri = config.MONGO_URI || 'mongodb://localhost/prerender';
  var interval = config.INTERVAL_DAYS || 15;
  var port = process.env.PORT;
  var prerenderURL = 'http://localhost:' + port;

  function getUrlsToFetch(done){

    database.collection('pages', function(err, pages) {
      if (err) { throw err; }

      var date = new Date();
      date.setDate(date.getDate() - interval);

      pages.find({
        $or: [
          { pending: true },
          { created: { $lt: date } }
        ]
      }).toArray(function (err, items) {
        if (err) { throw err; }

        var result = items || [];
        result = items.map(function(item){
          return item.key;
        });

        done && done(err, result);
      });

    });
  }

  function fetch(done){

    getUrlsToFetch(function(err, urls){
      if (err) return done(err);
      if (!urls || (urls && urls.length === 0)){
        return done(null, { urls: [] });
      }

      var urlsF = [];

      urls.forEach(function(_url){

        urlsF.push(
          (function(url){

            return function(done){
              request.get(prerenderURL + url, function (error, response) {
                if (error){ return done(error); }
                if (response.statusCode === 200){ return done(null, url); }
                done();
              });
            };

          })(_url)
        );

      });

      async.parallel(urlsF, function(err, result){
        done(err, { urls: result });
      });
    });
  }

  var access = {
    fetch: fetch,
    getUrlsToFetch: getUrlsToFetch
  };

  MongoClient.connect(mongoUri, function(err, db) {
    if (err) { return ready(err); }
    database = db;
    ready(err, access);
  });

};
