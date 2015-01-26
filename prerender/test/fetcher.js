
var chai = require('chai');
var expect = chai.expect;

var request = require('request');

var config = require('../config.json');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var baseURL = 'http://localhost:4001';
var url = '/http://localhost:3001';

var mongoUri = 'mongodb://localhost/prerender';
var interval = 1;

describe('Fetcher', function(){
  var fetcher;
  var pages;

  before(function(done){
    console.log('Connecting to MongoDB ' + mongoUri);

    MongoClient.connect(mongoUri, function(err, db) {

      if (err){
        console.log(err);
        return done(err);
      }

      db.collection('pages', function(err, collection) {

        pages = collection;

        pages.remove({}, { justOne: false }, function(err){
          if (err) { console.log(err); return done(err); }

          var date = new Date();
          date.setDate(date.getDate() - (config.INTERVAL_DAYS+2));

          pages.insert([{
            key: url + '?fresh1',
            created: new Date(),
            pending: false
          }, {
            key: url + '?fresh2',
            created: new Date(),
            pending: false
          }, {
            key: url + '?pending',
            created: new Date(),
            pending: true
          }, {
            key: url + '?outdated',
            created: date,
            pending: false
          }, {
            key: url + '?outdated',
            created: date
          }], function(err){
            if (err) { console.log(err); return done(err); }

            require('../fetcher')(config, function(err, _fetcher){
              fetcher = _fetcher;
              done();
            });

          });

        });
      });

    });
  });

  describe('#getUrlsToFetch', function(){

    it ('must only get pending or old cached urls', function(done){

      fetcher.getUrlsToFetch(function(err, urls){

        expect(err).to.not.be.ok();
        expect(urls).to.be.an('array');
        expect(urls.length).to.be.equal(3);

        urls.forEach(function(url){
          expect(url.indexOf("?fresh")).to.be.equal(-1);
        });

        done();
      });
    });

  });

  describe('#fetch', function(){

    it ('must fetch cache for pending or old ones', function(done){

      fetcher.fetch(function(err, result){

        expect(err).to.not.be.ok();

        expect(result.urls).to.be.an('array');
        expect(result.urls.length).to.be.equal(3);

        // if it's run again should do anything
        fetcher.fetch(function(err, result){

          expect(err).to.not.be.ok();

          expect(result).to.be.an('array');
          expect(result.urls.length).to.be.equal(0);

        });

        done();
      });
    });

  });

});
