
import request from 'supertest';
import {expect} from 'chai';

import cobbler from 'cobbler';
import {Dashboard} from 'lib/models';

describe('Dashboard', () => {

  let dashboards = [], agent, newDashboard, passport;

  before( done => {
    agent = request.agent(server);

    Dashboard.create([{
      domain: 'dash1',
      title: 'dashboard 1',
      owner: users[1]._id,
      projectsCount: 2,
      covers: ["1", "2"]
    }, {
      domain: 'dash2',
      title: 'dashboard 2',
      owner: users[1]._id,
      projectsCount: 2,
      covers: ["1", "2"]
    }, {
      domain: 'dash3',
      title: 'dashboard 3',
      owner: users[0]._id,
      projectsCount: 2,
      covers: ["1", "2"]
    }, {
      domain: 'dash4',
      title: 'dashboard 4',
      owner: users[0]._id,
    }, {
      domain: 'dash5',
      title: 'dashboard 5',
      owner: users[1]._id
    }], (err, _dashboards) => {
      dashboards = _dashboards;
      done(err);
    });

  });

  after( done => {
    Dashboard.remove({}, done);
  });

  it ('must return first N dashboards', done => {

    agent.get('/api/v2/dashboards').expect(200).end((err, res) => {
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.equal(3);

      res.body.forEach( dashboard => {
        expect(dashboard._id).to.be.ok;
      });

      done();
    });

  });

  it ('must return a dashboard by domain', done => {
    let id = dashboards[3]._id;
    agent.get('/api/v2/dashboards/' + dashboards[3].domain).expect(200).end((err, res) => {
      expect(res.body.domain).to.be.equal(dashboards[3].domain);
      expect(res.body._id).to.be.equal(id.toString());
      done();
    });
  });

  it ('must allow to create a Dashboard', done => {
    const dashboard = {
      domain: 'dash666'
    };

    passport = cobbler('session', users[0]._id);
    agent.post('/api/v2/dashboards').send(dashboard).expect(200).end((err, res) => {
      let _dash = res.body;
      expect(_dash._id).to.be.ok;

      expect(_dash.domain).to.be.equal(dashboard.domain);
      expect(_dash.open).to.be.true;

      expect(new Date(_dash.created_at)).to.be.lessThan(Date.now());

      newDashboard = _dash; // set this dashboard for next test of update
      passport.restore();
      done();
    });
  });

  it ('must allow to update a Dashboard', done => {
    const dashboard = {
      title: 'hello 1',
      open: false,
      description: 'some dash desc UPDATED',
      link: 'http://example.com/dash777',
      domain: 'dummy' // try to hack domain
    };

    passport = cobbler('session', users[0]._id);
    agent.put('/api/v2/dashboards/' + newDashboard.domain).send(dashboard).expect(200).end((err, res) => {
      let _dash = res.body;

      expect(_dash._id).to.be.equal(newDashboard._id);
      expect(_dash.domain).to.be.equal(newDashboard.domain);

      expect(_dash.title).to.be.equal(dashboard.title);
      expect(_dash.description).to.be.equal(dashboard.description);
      expect(_dash.link).to.be.equal(dashboard.link);
      expect(_dash.open).to.be.equal(dashboard.open);

      passport.restore();
      done();
    });
  });

  it ('must allow to update a Dashboard if is an Admin');

  it ('must NOT allow to update a Dashboard if is not an Admin', done => {
    passport = cobbler('session', users[1]._id);
    agent.put('/api/v2/dashboards/' + newDashboard.domain).expect(403).send({ title: 'will not update' }).end((err, res) => {
      expectCode(403, res);
      passport.restore();
      done();
    });
  });

  it ('must NOT allow to delete a Dashboard', done => {
    passport = cobbler('session', users[1]._id);
    agent.delete('/api/v2/dashboards/' + newDashboard.domain).expect(403).end((err, res) => {
      expectCode(403, res);
      passport.restore();
      done();
    });
  });

  it ('must NOT allow to delete a Dashboard if it has more than one Admin');

  it ('must allow to delete a Dashboard', done => {
    passport = cobbler('session', users[0]._id);
    agent.delete('/api/v2/dashboards/' + newDashboard.domain).expect(204).end((err, res) => {
      expectCode(204, res);

      agent.get('/api/v2/dashboards/' + newDashboard.domain).expect(404).end((err, res) => {
        expectCode(404, res);
        passport.restore();
        done();
      });
    });
  });

});
