
/**
 * Project schema
 */

import {Schema:{ObjectId}} from 'mongoose';
import statuses from './statuses';

export default const ProjectSchema = {
  'title':        { type: String, required: true },
  'domain':       String,
  'description':  { type: String, required: true },
  'leader':       { type: ObjectId, required: true, ref: 'User' },
  'status':       { type: String, enum: statuses, default: statuses[0] },
  'contributors': [{ type: ObjectId, ref: 'User'}],
  'followers':    [{ type: ObjectId, ref: 'User'}],
  'cover':        String,
  'link':         String,
  'tags':         [String],
  'created_at':   { type: Date, default: Date.now }
};
