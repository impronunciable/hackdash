
module.exports = {
    "domain": String
  , "title": String
  , "description": String
  , "link": String
  , "open": { type: Boolean, default: true }
  , "showcase": [String]
  , "created_at": { type: Date, default: Date.now }
};