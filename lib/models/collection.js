
/**
 * Collection schema
 */

import {Schema:{ObjectId}} from 'mongoose';

export default const CollectionSchema = {
  'owner':        { type: ObjectId, required: true, ref: 'User' },
  'title':        String,
  'description':  String,
  'dashboards':   [{ type: ObjectId, ref: 'Dashboard' }],
  'created_at':   { type: Date, default: Date.now }
};
