# Metrics for HackDash
Module responsible of fetching the entire database and build a json file with current data.
It run in background at a cron-timed rate generating and storing `metrics.json`.

## Config

In your `config.json` file:

* `cronTime`: Cron Expression for the rate execution [Cron Patters here](http://crontab.org/)
* `filename`: File name for the output JSON file. It will be created/ updated at this folder
* `code`: A secret code, used to fetch the url of metrics. Set as blank if metrics are public.

Check out `config.json.sample` for your own `config.json`.

## Start Service
```bash
npm install
npm start
```

## Exporting CSV

* Dashboards

Creates a dashboards.csv at this folder

```bash
node export_dashboards.js
```
