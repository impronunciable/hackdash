
/*
 * Migration Script for version v0.8.5 (May 2015)
 * Script to assign all Dashboards Owner:
 * Run throught every dashboard created and assigns
 * the new property [owner] if it has only ONE admin.
 */

var
    config = require('../../config.json')
  , async = require('async')
  , mongoose = require('mongoose');

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('../../models')({
  get: function(){
    return ['brainstorming','wireframing','building','researching','prototyping','releasing'];
  }
});

var Dashboard = mongoose.model('Dashboard');
var User = mongoose.model('User');

console.log('Updating dashboards ... ');

Dashboard
  .find({
    // Has NO Owner
    $or: [ { owner: { $exists: false } }, { owner: null }]
  })
  .exec(function(err, dashboards) {
    if(err) throw err;

    var calls = [];
    var countOwner = 0;
    var countRemoved = 0;

    dashboards.forEach(function(dashboard){

      calls.push((function(_dashboard){

        return function(_done){

          User
            .find({ admin_in: _dashboard.domain })
            .exec(function(err, admins){
              if (err) return _done(err);
              admins = admins || [];

              if (admins.length === 1){
                // If has ONE admin set it as owner
                _dashboard.owner = admins[0]._id;
                _dashboard.save(function(err){
                  if (!err) countOwner++;
                  _done(err);
                });

                return;
              }
              else if (admins.length === 0){
                // If has NO admins is an orphan dashboard
                _dashboard.remove(function(err){
                  if (!err) countRemoved++;
                  else return _done(err);

                  if (_dashboard.domain && _dashboard.domain !== "undefined"){
                    // clear users if has an admin_in
                    User.update(
                      { admin_in: _dashboard.domain },
                      { $pull: { admin_in: _dashboard.domain } }, function(err, users) {
                        _done(err);
                    });
                  }
                  else _done();

                });

                return;
              }

              _done();
            });
        };

      })(dashboard));

    });

    async.series(calls, function(err){
      if (err){
        console.log('Error Ocurred > ');
        console.log(err);
      }

      console.log('Updated %s | Removed %s Dashboards', countOwner, countRemoved);
      process.exit(0);
    });

  });
