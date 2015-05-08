
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

module.exports = {
    "domain": String
  , "title": String
  , "description": String
  , "link": String
  , "open": { type: Boolean, default: true }
  , "showcase": [String]
  , "owner": { type: ObjectId, ref: 'User' }
  , "created_at": { type: Date, default: Date.now }
  , "covers": [String]
  , "projectsCount": Number
};