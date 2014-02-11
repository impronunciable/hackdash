
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

module.exports = function(app) {

  var User = new Schema({
      "provider": { type: String, required: true }
    , "provider_id": { type: Number, required: true }
    , "username": { type: String, required: true }
    , "name": { type: String, required: true }
    , "email": { type: String, validate: /.+@.+\..+/ }
    , "picture": String
    , "admin_in": { type: [String], default: [] }
    , "bio": String
    , "created_at": {type: Date, default: Date.now },
  });

  User
    .virtual('profilePic')
    .get(function () {
      switch(this.provider){
        case "twitter": return "http://avatars.io/twitter/" + this.username;
        case "facebook": return "http://avatars.io/facebook/" + this.provider_id;
      }

      return this.picture;
    });

  mongoose.model('User', User);

  var Project = new Schema({
      "title": { type: String, required: true }
    , "domain": String
    , "description": { type: String, required: true }
    , "leader": { type: ObjectId, required: true, ref: 'User' }
    , "status": { type: String, enum: app.get('statuses'), default: app.get('statuses')[0] }
    , "contributors": [{ type: ObjectId, ref: 'User'}]
    , "followers": [{ type: ObjectId, ref: 'User'}]
    , "cover": String
    , "link": String
    , "tags": [String]
    , "created_at": { type: Date, default: Date.now }
  });

  mongoose.model('Project', Project);

  var Dashboard = new Schema({
      "domain": String
    , "created_at": { type:Date, default: Date.now }
    , "created_at": { type: Date, default: Date.now }
  });

  mongoose.model('Dashboard', Dashboard);
};
