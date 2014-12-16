
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

module.exports = {
    "owner": { type: ObjectId, required: true, ref: 'User' }
  , "title": String
  , "description": String
  , "dashboards": [{ type: ObjectId, ref: 'Dashboard' }]
  , "created_at": { type: Date, default: Date.now }
};
