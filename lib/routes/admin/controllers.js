
/**
 * Module dependencies
 */

import {Dashboard} from 'lib/models';

/*
 * Check if not installed
 */

export const notInstalled = async ({user}, res, next) => {
  try {
    let dashboard = Dashboard.findOne({ 'admin': { $exists: true } }).exec();
    if(!dashboard || (dashboard.admin == user.id && !user.is_admin)) {
      if (!dashboard) {
        dashboard = new Dashboard({ admin: user.id });
        await dashboard.save();
      }

      res.locals.user = req.user;
      user.is_admin = true;
      await user.save();
      next();
    } else { 
      res.redirect('/'); 
    }
  } catch(err) {
    next(err);
  }
};
