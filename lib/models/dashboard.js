
/**
 * Dashboard schema
 */

import {Schema:{ObjectId}} from 'mongoose';

export default const DashboardSchema = {
  'domain':         String,
  'title':          String,
  'description':    String,
  'link':           String,
  'open':           { type: Boolean, default: true },
  'showcase':       [String],
  'owner':          { type: ObjectId, ref: 'User' },
  'created_at':     { type: Date, default: Date.now },
  'covers':         [String],
  'projectsCount':  Number
};
