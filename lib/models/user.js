
/**
 * User Schema
 */

export default {
  'provider':     { type: String, required: true },
  'provider_id':  { type: String, required: true },
  'username':     { type: String, required: true },
  'name':         { type: String, required: true },
  'email':        { type: String, validate: /.+@.+\..+/ }, // TODO: Improve this validation
  'picture':      String,
  'admin_in':     { type: [String], default: [] },
  'bio':          String,
  'created_at':   {type: Date, default: Date.now }
};
