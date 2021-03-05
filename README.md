HackDash
========


Organize hackaton ideas into a dashboard

![HackDash Logo](http://i.imgur.com/XLQGF3y.png)

Install
===========

I wrote a [blog post](http://zajdband.com/installing-hackdash) explaining the installation process. Also check the [wiki](https://github.com/danzajdband/hackdash/wiki) for more info and docs

Config
======

In your `config.js`: We can chanage defaut values and configuration will be loaded form 
`.env` file.

* `db`:
	+ `url`: Overrides other db config. Full MongoDB URL. Override form environment variable `DB_URL`
	+ `host` Override form environment variable `DB_HOST`
	+ `port` Override form environment variable `DB_POST`
* `host`: Your instance host (i.e. yourdomain.com) Override form environment variable `HOST`
* `port`: Your port (i.e. 3000) Override form environment variable `PORT`
* `session`: Your session key (it must be a secret string) Override form environment variable `SESSION`
* `title`: Instance title used in the html title tag and other headings. Override form environment variable `TITLE`
* `live`: Boolean (true, false) that enable/disable the live feed feature in yourdomain.com/live. Override form environment variable `LIVE`
* `mailer`: SMTP mail info to enable email notifications using nodemailer. Check out the [options](https://github.com/andris9/Nodemailer#setting-up-smtp) Override form environment variable `MAILER`
* `team`: An array of `user`.`_id` to be shown as Team on Landing Page.
* `maxQueryLimit`: a Number for the max amount of results at the landing page searchs. Override form environment variable `MAX_QUERY_LIMIT`
* `googleAnalytics`: the UA-XXXXXXXX-X code from Google Analytics. if not specified wont set the script. Override form environment variable `GOOGLE_ANALYTICS`
* `facebookAppId`: the Facebook App Id for share buttons. It will take first from keys.json, if not will use this one. Don't set it to not show FB share buttons. Override form environment variable `FCAEBOOK_APP_ID`
* `prerender`:
	+ `enabled`: Boolean (true, false). Where the website would use the SEO Prerender. Override form environment variable `PREPENDER_ENABLE` 
	+ `db`: The Mongo URI of Cached Pages. Override form environment variable `PREPENDER_DB`

Running instances
=================

* [HackDash platform](http://hackdash.org): Create your own Dashboard for free. Maintained by the HackDash Creators.
* [Auth0 HackDash platform](http://safe-tor-9833.herokuapp.com/): Create a Dashboard for your company using Auth0 service.
* [BAHackaton](http://bahackaton.herokuapp.com): Buenos Aires City hackaton ideas.

Add your own Dashboard!


Contribute
==========
Please check the [WIKI](https://github.com/danzajdband/hackdash/wiki)
