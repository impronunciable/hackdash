
/**
 * Dashboard controllers
 */

/**
 * Module dependencies
 */

import {Project, User, Dashboard} from 'lib/models';
import {maxQueryLimit} from 'config';

const maxLimit = maxQueryLimit || 50;

export const validateSubdomain = ({body}, res, next) =>
  /^[a-z0-9]{5,10}$/.test(body.domain) ? next() : res.status(500).send({ error: "subdomain_invalid" });

export const createDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({domain: req.body.domain}).exec();
    if(dashboard) throw new Error();
  } catch(err) {
    return res.status(409).send({ error: "subdomain_inuse" });
  }

  const newDashboard = new Dashboard({
    domain: req.body.domain,
    owner: req.user._id
  });

  try {
    const savedDashboard = await newDashboard.save();
    const admin = await User.findById(req.user.id).exec();
    admin.admin_in.push(req.body.domain);
    await admin.save();
    req.dashboard = savedDashboard;
    next();
  } catch(err) {
    next(err);
  }
};

export const setQuery = (req, res, next) => {
  const query = req.query.q || '';
  req.limit = req.query.limit || maxLimit;
  req.page = req.query.page || 0;

  if (req.limit > maxLimit) {
    req.limit = maxLimit;
  }

  req.search_query = {};

  if (query.length === 0) {
    req.search_query.$and = [
      { projectsCount: { $gt : 1 } },
      { covers: { $exists: true } },
      { $where:'this.covers.length>0' }
    ];
    return next();
  }

  const regex = new RegExp(query, 'i');
  req.search_query.$or = [ { domain: regex }, { title: regex }, { description: regex } ];
  next();
};

export const setDashboards = async (req, res, next) => {
  const limit = req.limit || maxLimit;
  try {
    const dashboards = await Dashboard.find(req.search_query || {})
      .select('-__v')
      .skip(req.page ? req.page*limit : 0)
      .limit(limit)
      .sort( { "created_at" : -1 } )
      .exec();
    req.dashboards = dashboards || [];
    next();
  } catch(err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  let domain;
  if (req.subdomains.length) {
    domain = req.subdomains[0];
  } else if (req.params.domain) {
    domain = req.params.domain;
  } else {
    return res.status(400).send('Expected a dashboard name');
  }

  try {
    const dashboard = await Dashboard.findOne({domain}).select('-__v')
      .populate('owner', '_id name picture bio').exec();
    if(!dashboard) return res.status(404).end();
    req.dashboard = dashboard;
    next();
  } catch(err) {
    res.status(500).end();
  }
};

export const isAdminDashboard = ({user, dashboard}, res, next) =>
  user.admin_in.indexOf(dashboard.domain) >= 0 ? next() : res.status(403).send('Only Administrators are allowed for this action.');

export const isOwnerDashboard = async ({user, dashboard}, res, next) => {
  if (!dashboard.owner) {
    return res.status(403).send('This dashboard cannot be removed because it has no owner.');
  }

  if (dashboard.owner._id.toString() !== user._id.toString()) {
    return res.status(403).send('Only Owner can remove this dashboard.');
  }

  if (dashboard.projectsCount > 0) {
    return res.status(403).send('Only Dashboards with no projects can be removed.');
  }

  const count = User.count({ admin_in: dashboard.domain });
  if (count > 1){
    return res.status(403).send('Only Dashboards with ONE admin can be removed.');
  }
  next();
};

export const updateDashboard = async (req, res, next) => {
  const dashboard = req.dashboard;
  const getValue = prop => req.body.hasOwnProperty(prop) ? req.body[prop] : dashboard[prop];

  if(req.body.link && req.body.link.indexOf('http') != 0) {
    req.body.link = `http://${req.body.link}`;
  }

  dashboard.title = getValue('title');
  dashboard.description = getValue('description');
  dashboard.link = getValue('link');
  dashboard.open = getValue('open');

  const showcase = getValue('showcase');
  if (Array.isArray(showcase)){
    dashboard.showcase = showcase;
  }

  try {
    const newDashboard = await dashboard.save();
    req.dashboard = dashboard;
    next();
  } catch(err) {
    res.status(500).end();
  }
};

export const removeDashboard = async ({dashboard}, res) => {
  const domain = dashboard.domain;
  try {
    await dashboard.remove();
  } catch(err) {
    res.status(500).send('An error ocurred when removing this dashboard');
  }

  try {
    await User.update({ admin_in: domain }, { $pull: { admin_in: domain } });
    res.status(204).end();
  } catch(err) {
    res.status(500).send(`error removing users admin_in from dashboard: ${domain}`);
  }
};

export const sendDashboard = ({isFull, dashboard}, res) =>
  isFull ? res.jsonp(dashboard) : res.send(dashboard);

export const sendDashboards = (req, res) => res.send(req.dashboards);

const CSVEscape = (field='') => String(field).replace(/\"/g, '""').replace(/,/g, '');

const projectToCSV = project => {
  const people = [];
  const addPerson = (engagement, user) => people.push([user.name, user.username,
      user.provider, user.email, engagement, project.title, project.status, domain]);

  project.contributors.forEach(addPerson.bind(null, 'contributor'));
  project.contributors.forEach(addPerson.bind(null, 'follower'));

  // sort people by name ASC
  people.sort((a, b) => a[0] - b[0]);
  return people.map(person => `${person.map(CSVEscape).join(',')}\n`).join('');
};

export const sendDashboardCSV = ({dashboard}, res) => {
  const start = response => {
    response.setHeader('Content-disposition', `attachment; filename=${domain}.csv`);
    response.contentType('csv');
    response.write(`${headers}\n`);
    started = true;
  };

  const {domain} = dashboard;
  const headers = ['name', 'username', 'provider', 'e-mail', 'engagement',
                    'project', 'status', 'dashboard'].map(CSVEscape).join(',');

  let started = false;
  Project.find({domain})
    .populate('contributors')
    .populate('followers')
    .sort('title')
    .stream()
    .on('data', project => {
      if (!started) { start(res); }
      res.write(projectToCSV(project));
    })
    .on('close', () => res.end())
    .on('error', err => res.send(500, {err, msg: "Failed to get projects"}));
};
