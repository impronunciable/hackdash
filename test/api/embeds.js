
var request = require('request');
var base_url = 'http://local.host:3000';

var chai = require('chai');
var expect = chai.expect;

describe('Embeds', function(){

  describe('/dashboards', function(){

    var uri = '/api/v2/dashboards';

    it ('must return a json without a content-type', function(done){

      request.get(base_url + uri + '/testadmin', function (error, response, body){

        expect(response.statusCode).to.be.equal(200);

        expect(function(){
          JSON.parse(body);
        }).to.not.throw();

        done();
      });

    });

    it ('must retrieve a jsonp with a content-type of javascript', function(done){

      request.get(base_url + uri + '/testadmin.jsonp?callback=cb'
      , function (error, response, body){
        expect(response.statusCode).to.be.equal(200);
        
        var startPos = body.indexOf('({');
        var endPos = body.indexOf('})');

        expect(startPos).to.be.greaterThan(-1);
        expect(endPos).to.be.greaterThan(-1);
        
        expect(function(){
          JSON.parse(body);
        }).to.throw();

        expect(function(){
          JSON.parse(body.substring(startPos+1, endPos+1));
        }).to.not.throw();

        done();
      });

    });

    it ('must retrieve a Full Dashboard', function(done){

      function mustHave(obj, props){
        props.forEach(function(p){
          expect(obj).to.have.property(p);
        });
      }

      function mustNOTHave(obj, props){
        props.forEach(function(p){
          expect(obj).to.not.have.property(p);
        });
      }

      getJsonFromJsonP(base_url + uri + '/testadmin.jsonp?callback=cb', function(err, data){

        mustHave(data, [
          '_id',
          'title',
          'description',
          'link',
          'domain',
          'created_at',
          'open',
          'projects'
        ]);

        mustNOTHave(data, [ '__v' ]);

        expect(data.projects).to.be.an('array');

        data.projects.forEach(function(p){

          mustHave(p, [
            '_id', 
            'cover', 
            'status',
            'title',
            'description',
            'link',
            'contributors',
            'followers',
            'created_at'
          ]);

          mustNOTHave(p, [ '__v', 'leader', 'tags' ]);

          expect(p.contributors).to.be.a('number');
          expect(p.followers).to.be.a('number');

        });        

        done();
      });

    });
  });

});

function getJsonFromJsonP(url, callback) {

  request.get(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      var jsonpData = body;
      var json;

      try {
        json = JSON.parse(jsonpData);
      }
      catch(e) {
        var startPos = jsonpData.indexOf('({');
        var endPos = jsonpData.indexOf('})');
        var jsonString = jsonpData.substring(startPos+1, endPos+1);
        json = JSON.parse(jsonString);
      }

      callback(null, json);
      
    } else {
      callback(error);
    }
  });
};