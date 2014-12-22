
/*
 * SEO MiddleWare
 *
 * Responsible of checking if a request is from a Search Engine
 * If so, returns a Cached page if exists, otherwise goes on and 
 * marks the url as pending for being cached
 */

var prerender = require('prerender-node');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var db;

module.exports = function(app) {

  var prCfg = app.get('config').prerender;
  var db_uri = prCfg.db || 'mongodb://localhost/prerender'

  MongoClient.connect(db_uri, function(err, _db) {
    if (err) { 
      console.log(err);
      return;
    }

    db = _db
  });

  return function(req, res, next){

    if (!db){
      console.log('no database connection for prerender found.');
      return next();
    }

    if(!prerender.shouldShowPrerenderedPage(req)) {
      // is not a Search Engine -> GO ON
      return next();
    }

    // IS A SEARCH ENGINE ------------------------------------------

    var url = '/' + req.protocol + "://" + req.get('host') + req.url;

    getCachedPage(url, function(err, page){

      if (!page){
        // Not cached page, store as pending and go on
        setCachedPage(url);
        return next();
      }

      if (!page.pending){
        // Exists and is not pending

        if (page.value && page.value.trim().length > 0){
          // has a valid value 
          return res.send(200, removeScripts(page.value) );
        }
        
        // for some reason the cache is invalid, re build it
        reCachePage(url);
      }

      return next();
    });

  };
};

function getCachedPage(url, done){

  db.collection('pages', function(err, collection) {
    collection.findOne({ key: url }, done);
  });
}

function setCachedPage(url){

  db.collection('pages', function(err, collection) {
    if (err){ return console.log(err); }

    collection.insert({ 
      key: url, 
      value: '',
      created: new Date(),
      pending: true
    }, { w: 0 });

  });
}

function reCachePage(url){

  db.collection('pages', function(err, collection) {
    if (err){ return console.log(err); }

    collection.remove({ key: url }, function(err){
      if (err){ return console.log(err); }

      setCachedPage(url);
    });

  });
}

function removeScripts(html){

  var matches = html.toString().match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
  for (var i = 0; matches && i < matches.length; i++) {
    if(matches[i].indexOf('application/ld+json') === -1) {
      html = html.toString().replace(matches[i], '');
    }
  }

  return html;
}