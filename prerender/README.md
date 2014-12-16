# Prerender

Module responsible of creating and managing a Client Cached version of each page crawled by a Serch Engine (like, google, bing, yahoo, etc)

## How it works
Run in background as a service for HackDash at a defined port. It expose a url to fetch web pages already renederer by PhantomJS from a Search Engine Crawler. Hackdash proxies all request from a crawler to this service.  
All this magic is done thanks to [Prerender Service](https://github.com/prerender/prerender)

## Config

In your `config.json` file:

* `MONGO_URI`: Full MongoDB URI (i.e.: mongodb://localhost:28017/prerender)
* `PORT`: Process port of this process web server. i.e. 4000. Can be set as PORT enviroment variable
* `INTERVAL_DAYS`: Number, days to refresh cache. When crawler asks for a page, if the created date is greater than this interval, will recreate it with PhantomJS.
* `WORKERS`: Number of PhantomJS processes to start (default 1)
* `ITERATIONS`: Number, Ammount of requests to server before restarting phantomjs (default 200)

Check out `config.json.sample` for your own `config.json`.

## Start Service
```bash
npm install
npm start
```
And go to [http://localhost:4000/http://hackdash.org](http://localhost:4000/http://hackdash.org)

## Run tests
```
grunt test
```


