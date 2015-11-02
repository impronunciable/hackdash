
import request from 'supertest';
import {expect} from 'chai';

import {Collection} from 'lib/models';

describe('Collection', () => {

  let collections = [], agent;

  before( done => {
    agent = request.agent(server);

    Collection.create([{
      title: 'collection title 1',
      description: 'collection description 1',
      owner: users[1]._id,
      dashboards: []
    }, {
      title: 'collection title 2',
      description: 'collection description 2',
      owner: users[1]._id,
      dashboards: []
    }, {
      title: 'collection title 3',
      description: 'collection description 3',
      owner: users[0]._id,
      dashboards: []
    }, {
      title: 'collection title 4',
      description: 'collection description 4',
      owner: users[0]._id,
      dashboards: []
    }], (err, _collections) => {
      collections = _collections;
      done(err);
    });

  });

  after( done => {
    Collection.remove({}, done);
  });

  it ('must return first N collections', done => {

    agent.get('/api/v2/collections').expect(200).end((err, res) => {
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.equal(4);

      res.body.forEach( collection => {
        expect(collection._id).to.be.ok;
      });

      done();
    });

  });

  it ('must return a collection by id', done => {
    let id = collections[3]._id;

    agent.get('/api/v2/collections/' + id).expect(200).end((err, res) => {
      expect(res.body._id).to.be.equal(id.toString());
      expect(res.body.title).to.be.equal(collections[3].title);
      expect(res.body.description).to.be.equal(collections[3].description);
      done();
    });
  });

});
