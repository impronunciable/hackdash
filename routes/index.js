
module.exports = function(app) {

  app.locals.moment = require('moment');

  require('./site')(app);
  require('./api')(app);

};
