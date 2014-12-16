
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , statuses = require('./statuses');

module.exports = {
    "title": { type: String, required: true }
  , "domain": String
  , "description": { type: String, required: true }
  , "leader": { type: ObjectId, required: true, ref: 'User' }
  , "status": { type: String, enum: statuses, default: statuses[0] }
  , "contributors": [{ type: ObjectId, ref: 'User'}]
  , "followers": [{ type: ObjectId, ref: 'User'}]
  , "cover": String
  , "link": String
  , "tags": [String]
  , "created_at": { type: Date, default: Date.now }
};
