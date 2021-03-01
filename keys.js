require('dotenv').config()
module.exports = {
    
  "github": {
        "clientID": process.env.GITHUB_CLIENT_ID
      , "clientSecret": process.env.GITHUB_SECRET_KEY
      , "callbackURL": process.env.GITHUB_CALLBACK_URL
    }
}
