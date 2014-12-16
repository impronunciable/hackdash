
module.exports = {
    "provider": { type: String, required: true }
  , "provider_id": { type: Number, required: true }
  , "username": { type: String, required: true }
  , "name": { type: String, required: true }
  , "email": { type: String, validate: /.+@.+\..+/ }
  , "picture": String
  , "admin_in": { type: [String], default: [] }
  , "bio": String
  , "created_at": {type: Date, default: Date.now },
};
