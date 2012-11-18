
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

module.exports = function(app) {

  var User = new Schema({
      "provider": { type: String, required: true }
    , "provider_id": { type: Number, required: true }
    , "username": { type: String, required: true }
    , "created_at": {type: Date, default: Date.now }
  });

  mongoose.model('User', User);

  var Project = new Schema({
      "title": { type: String, required: true }
    , "summary": { type: String, required: true }
    , "description": { type: String, required: true }
    , "leader": { type: ObjectId, required: true, ref: 'User' }
    , "status": { type: String, enum: app.get('statuses'), default: app.get('statuses')[0] }
    , "contributors": [{ type: ObjectId, ref: 'User'}]
    , "followers": [{ type: ObjectId, ref: 'User'}]
    , "link": String 
    , "tags": [String]
    , "created_at": { type: Date, default: Date.now }
  });

  mongoose.model('Project', Project);
};
