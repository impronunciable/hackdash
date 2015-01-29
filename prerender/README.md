# Prerender

Module responsible of creating and managing a Client Cached version of each page crawled by a Serch Engine (like, google, bing, yahoo, etc). 

## How it works
Hackdash webserver sets a `pending` value on each page asked by a Crawler. This process goes throw every url set as `pending` or `created` older than `INTERVAL_DAYS` and creates a client cached version, then next time Crawler asks for that url it will response the cached one using [Prerender Service](https://github.com/prerender/prerender).  

**The process uses PhantomJS 1.9 for render, as it has some memory leaks it is not ready for production use, so use with caution.**

## Config

In your `config.json` file:

* `MONGO_URI`: Full MongoDB URI (i.e.: mongodb://localhost:28017/prerender)
* `PORT`: Process port of this process web server. i.e. 4000. Can be set as PORT enviroment variable
* `INTERVAL_DAYS`: Number, days to refresh cache. When crawler asks for a page, if the created date is greater than this interval, will recreate it with PhantomJS.
* `WORKERS`: Number of PhantomJS processes to start (default 1)
* `ITERATIONS`: Number, Ammount of requests to server before restarting phantomjs (default 200)

Check out `config.json.sample` for your own `config.json`.

## Run the process
```bash
npm install
node index
```

If is run with `npm start` will throw some errors because it's killing the entire tree on finsih. Ignore them.

## Run tests
```
grunt
```


