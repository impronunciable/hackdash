
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  fs = require('fs'),
  moment = require('moment');

var config = require('../config.json');

mongoose.connect(config.db.url ||
  ('mongodb://' + config.db.host + '/'+ config.db.name));

mongoose.model('User', new Schema(require('../models/User')) );
mongoose.model('Dashboard', new Schema(require('../models/Dashboard')) );

var Dashboard = mongoose.model('Dashboard');
var User = mongoose.model('User');

var wstream = fs.createWriteStream(__dirname + '/dashboards_admins.csv');

function CSVEscape(field) {
  return String(field || "").replace(/\"/g, '""').replace(/,/g, '');
}

var headers = [
    'name'
  , 'title'
  , 'created'
  , 'admins'
  , 'open'
  , 'link'
].map(CSVEscape).join(',');

wstream.write(headers + '\n');

var count = 0;
var wrotes = 0;

var admins_counter = [];

Dashboard.count({}, function(err, _count){
  console.log('Reading %s Dashboards', _count);
  count = _count;

  Dashboard.find({})
    .sort( { "created_at" : -1 } )
    .stream()
    .on('data', function (dashboard) {
      getDashboardCSV(dashboard, function(err, data){
        wstream.write(data);
        wrotes++;
        wrote(dashboard);
      });
    })
    .on('close', function () {
      console.log('finished readings ...');
    })
    .on('error', function (err) {
      wstream.end();
      throw err;
    });
});

function wrapup(){
  console.log('All done! - Wrote %s Dashboards', wrotes);

  console.log('Counts Dashboards admins --------------- ');
  admins_counter.forEach(function(value, i){
    console.log('%s: %s', i, value);
  });

  process.exit(0);
}

function wrote(dashboard){
  count--;
  if (count <= 0){
    wstream.on('finish', wrapup); //node >= 0.10
    wstream.end(wrapup); //node < 0.10
  }
}

var getDashboardCSV = function(dashboard, done){

  var dash = {
    name: dashboard.domain,
    title: dashboard.title,
    created: dashboard.created_at,
    admins: [],
    open: dashboard.open,
    link: 'http://hackdash.org/dashboards/' + dashboard.domain
  };

  User
    .find({ admin_in: dashboard.domain })
    .exec(function(err, users){
      if (err) return done(err);
      users = users || [];

      users.forEach(function(item){
        dash.admins.push(item._id);
      });

      if (!admins_counter[dash.admins.length]){
        admins_counter[dash.admins.length] = 0;
      }

      admins_counter[dash.admins.length]++;

      done(null, [
        dash.name,
        dash.title,
        moment(dash.created).format('DD/MM/YYYY'),
        dash.admins.join('|'),
        dash.open.toString(),
        dash.link
      ].map(CSVEscape).join(',') + '\n');

    });

};
