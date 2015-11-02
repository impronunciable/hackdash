
import request from 'supertest';
import {expect} from 'chai';

import {User} from 'lib/models';

describe('API', () => {

  before( done => {

    // create some test users for auth routes
    User.create([{
      provider: 'twitter',
      provider_id: '1111111',
      username: 'testuser1',
      displayName: 'Test User 1',
      name: 'Test User 1'
    }, {
      provider: 'twitter',
      provider_id: '2222222',
      username: 'testuser2',
      displayName: 'Test User 2',
      name: 'Test User 2'
    }], (err, _users) => {
      global.users = _users;
      done(err);
    });

  });

  it ('must return 200 ok', done => {
    let agent = request.agent(server);
    agent.get('/').expect(200).end((err, res) => {
      expectCode(200, res);
      done();
    });
  });

  require('./dashboard');
  require('./collection');

});
