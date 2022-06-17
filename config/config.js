require('dotenv').config();

module.exports = {
  "db": {
    "name": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "url": process.env.DATABASE_URL,
  },
  "host": process.env.HOST,
  "port": parseInt(process.env.PORT) || 3000,
  "session": process.env.SESSION,
  "discourseUrl": process.env.DISCOURSE_URL || null,
  "disqus_shortname": process.env.DISQUS_SHORTNAME || null,
  "title": process.env.TITLE || "hackdash",
  "live": process.env.LIVE || true,
  "mailer": process.env.MAILER || null,
  "prerender": {
    "enabled": process.env.PRERENDER_ENABLE || false,
    "db": process.env.PRERENDER_DB || "mongodb://localhost/prerender"
  },
  "team": [
    "516d1997b2951b02280000e1",
    "516d1997b2951b02280000e2",
    "516d1997b2951b02280000e3",
    "516d1997b2951b02280000e4",
    "516d1997b2951b02280000e5",
    "516d1997b2951b02280000e6"
  ],
  "maxQueryLimit": process.env.MAX_QUERY_LIMIT || 30,
  "googleAnalytics": process.env.GOOGLE_ANALYTICS || "UA-XXXXXXXX-X",
  "facebookAppId": process.env.FACEBOOK_APP_ID || "YYYYYYYYYYYY"
};
