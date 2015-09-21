
/**
 * Collection schema
 */

import {Schema} from 'mongoose';

export default {
  'owner':        { type: Schema.ObjectId, required: true, ref: 'User' },
  'title':        String,
  'description':  String,
  'dashboards':   [{ type: Schema.ObjectId, ref: 'Dashboard' }],
  'created_at':   { type: Date, default: Date.now }
};
