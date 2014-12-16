# Sitemap Generator
Module responsible of fetching HackDash data base and build up a Sitemap.xml for Search Engine Crawlers.  
It run in background at a cron-timed rate generating and storing `/public/sitemap.xml`.

## Config

In your `config.json` file:

* `cronTime`: Cron Expression for the rate execution [Cron Patters here](http://crontab.org/)
* `projects`: `URL JSON Config` for Projects
* `dashboards`: `URL JSON Config` for Dashboards
* `collections`: `URL JSON Config` for Collections

### URL JSON Config
```javascript
{
  "url": String, // The relative URL. (only projects, dashboards and collections supported)
  "changefreq": String, // always, hourly, daily, weekly, monthly, yearly, never
  "priority": Number // (Decimal 0 to 1). Priority of the URL. Where 0.1 is 10% and 1 is 100%
}
```

Check out `config.json.sample` for your own `config.json`.

## Start Service
```bash
npm install
npm start
```
