
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

describe('Prerender', function(){
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

        pages.remove({ key: url }, function (err) {
          done();
        });
      });

    });
  });

  it('must cache a page on first fetch as Crawler', function(done){

    request.get(baseURL + url, function (error, response, body) {
      expect(error).to.not.be.ok();
      expect(response.statusCode).to.be.equal(200);
      
      pages.findOne({ key: url }, function (err, item) {
        expect(item.key).to.be.equal(url);
        expect(item.value.length).to.be.greaterThan(0);
        expect(item.created).to.be.lessThan(new Date());
        done();
      });
    });
  });

  it('must return the cached page if is in the interval', function(done){

    pages.findOne({ key: url }, function (err, item) {
      var currentValue = item.value;
      
      request.get(baseURL + url, function (error, response, body) {
        expect(error).to.not.be.ok();
        expect(response.statusCode).to.be.equal(200);
          
        pages.findOne({ key: url }, function (err, item) {
          expect(item.value).to.be.equal(currentValue);
          done();
        });
      });
    });
  });

  it('must delete the current cached if is less than interval', function(done){

    pages.findOne({ key: url }, function (err, item) {
      var currentValue = item.value;

      var date = new Date();
      date.setDate(date.getDate() - (config.INTERVAL_DAYS+2));

      pages.update({ key: url }, { $set: { value: 'NEW HTML', created: date } }, function (err, item) {

        pages.findOne({ key: url }, function (err, item) {
          expect(item.value).to.be.equal('NEW HTML');
          expect(item.created).to.be.eql(date);

          request.get(baseURL + url, function (error, response, body) {
            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
              
            pages.findOne({ key: url }, function (err, item) {
              expect(item.value).to.be.equal(currentValue);
              done();
            });
          });

        });

      });
    });
  });

});
