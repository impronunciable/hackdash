var
    config = require('../config.json')
  , async = require('async')
  , mongoose = require('mongoose');

mongoose.connect(config.db.url || ('mongodb://' + config.db.host + '/'+ config.db.name));

require('../models')({
  get: function(){
    return ['brainstorming','wireframing','building','researching','prototyping','releasing'];
  }
});

var program = require('commander');

program
  .version('1.0.0')
  .usage('[options] -t "My Collection" -d dash1,dash2,dash3 -o MONGO_DB_USER_ID')
  .option('-t, --title <title>', 'Title of collection')
  .option('-o, --owner <userid>', 'The user id Owner of the collection')
  .option('-d, --dashboards <items>', 'Dashboards domains separated by an space')
  .parse(process.argv);

function dashboards(val) {
  return val.split(',');
}

if (!program.dashboards || program.dashboards.length === 0){
  console.log('At least one dashboard is required, use -d dash1,dash2');
  process.exit(1);
}

if (!program.owner){
  console.log('An User Id as owner is required, use -o XXXYYYZZZ');
  process.exit(1);
}

var collection = {
  title: program.title || '',
  dashboards: (program.dashboards).split(','),
  owner: program.owner
}

var Dashboard = mongoose.model('Dashboard');
var User = mongoose.model('User');
var Collection = mongoose.model('Collection');

async.waterfall([

  function (done){ // confirm collection
    console.log(">>> About to create this collection: ");
    console.dir(collection);

    program.confirm('Continue? ', function(ok){
      if (ok) return done(null, collection);
      done('canceled');
    });
  },

  function (collection, done){ // check User Owner Existance
    //console.log(">>> Creating collection ... ");
    console.log(">>> Validating User Owner ... ");

    User.findById(collection.owner).exec(function(err, user){
      if (err) return done(err);
      if (!user) return done(new Error("User with ID "+collection.owner+" was not found"));
      done(null, collection);
    });
  },

  function (collection, done){ // validate dashboards
    console.log(">>> Validating Dashboards ... ");

    Dashboard
      .find({ domain: { $in: collection.dashboards }})
      .select('_id domain').exec(function(err, dashboards){

      if (err) return done(err);
      if (!dashboards || dashboards.length === 0) return done(new Error("No dashboards where found"));

      var dashIds = dashboards.map(function(d) { return d._id; });
      var dashboards = dashboards.map(function(d) { return d.domain; });

      var notFounds = collection.dashboards.filter(function(dash){
        return (dashboards.indexOf(dash) === -1 ? true : false );
      });

      if (notFounds.length > 0){
        return done(new Error("Dashboards "+notFounds.join(',')+" where not found"));
      }

      collection.dashboards = dashIds;

      done(null, collection);
    });
  },

  function (collection, done){ // last chance
    console.log(">>> Creating collection: ");
    console.dir(collection);

    program.confirm('Is it ok? ', function(ok){
      if (ok) return done(null, collection);
      done('canceled');
    });
  },

  function (collection, done){ // create the collection
    Collection.create(collection, function(err, collection){
      if(err) return done(err);
      done(null, collection);
    });
  }

], function(err, collection){
  if (err === 'canceled'){
    console.log('canceled!');
    process.exit(0);
  }
  else if (err){
    throw err;
  }

  console.log('collection created! Visit ' + 'https://hackdash.org/collections/' + collection._id);
  process.exit(0);
});
