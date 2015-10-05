

/**
 * Metrics routes controllers
 */

/**
 * Module dependencies
 */

import {code, filename} from 'metrics/config';
import {readFile} from 'fs';
import {Project} from 'lib/models';

/*
 * Check link is valid
 */

export const isValidLink = ({query={}}, res, next) => (query.q || "") === code ? next() : res.send(400);

/*
 * Set Metrics JSON
 */

export const setMetrics = (req, res, next) => {
  readFile(`metrics/${filename}`, (err, metrics) => {
    if (err) {
      next(err);
    } else {
      res.locals.metrics = JSON.parse(metrics);
      next();   
    }
  });
};

/*
 * Set Counts from Metrics JSON
 */

export const sendCounts = async (req, res, next) => {
  const {dashboards, projects, users, collections} = res.locals.metrics;
  const counts = {
    dashboards: dashboards.total,
    projects: projects.total,
    users: users.total,
    collections: collections.total,
    releases: 0
  };

  try {
    const count = await Project.count({ status: 'releasing' }).exec();
    counts.releases = count;
    res.send(counts);
  } catch(err) {
    next(err);
  }
};
