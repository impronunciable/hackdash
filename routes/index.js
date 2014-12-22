
module.exports = function(app) {

  app.locals.moment = require('moment');
  app.locals.md = require('markdown').markdown.toHTML;

  app.locals.isLeader = function(user, project) {
    return user.id === project.leader.id;
  };

  app.locals.isAdmin = function(user, project) {
    return (project.domain && user.admin_in.indexOf(project.domain) >= 0);
  };

  require('./api/v2')(app);

  require('./site')(app);
  require('./admin')(app);
  require('./metrics')(app);

};
