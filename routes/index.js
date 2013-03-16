
module.exports = function(app) {

  app.locals.moment = require('moment');
  app.locals.md = require('markdown').markdown.toHTML;

  app.locals.isLeader = function(user, project) {
    return (user.is_admin || user.id === project.leader.id);
  };

  require('./site')(app);
  require('./api')(app);
  require('./admin')(app);

};
