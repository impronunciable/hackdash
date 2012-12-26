
module.exports = function(app) {

  app.locals.moment = require('moment');
  app.locals.md = require('markdown').markdown.toHTML;

  require('./site')(app);
  require('./api')(app);
  require('./admin')(app);

};
