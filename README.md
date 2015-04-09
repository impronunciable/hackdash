HackDash
========

Organize hackaton ideas into a dashboard

![HackDash Logo](http://i.imgur.com/XLQGF3y.png)

Install
===========

I wrote a [blog post](http://zajdband.com/installing-hackdash) explaining the installation process.

Config
======

In your `config.json`:

* `db`:
	+ `url`: Overrides other db config. Full MongoDB URL.
	+ `host`
	+ `port`
* `host`: Your instance host (i.e. yourdomain.com)
* `port`: Your port (i.e. 3000)
* `session`: Your session key (it must be a secret string)
* `title`: Instance title used in the html title tag and other headings.
* `live`: Boolean (true, false) that enable/disable the live feed feature in yourdomain.com/live.
* `mailer`: SMTP mail info to enable email notifications using nodemailer. Check out the [options](https://github.com/andris9/Nodemailer#setting-up-smtp)
* `team`: An array of `user`.`_id` to be shown as Team on Landing Page.
* `maxQueryLimit`: a Number for the max amount of results at the landing page searchs.
* `prerender`: 
	+ `enabled`: Boolean (true, false). Where the website would use the SEO Prerender 
	+ `db`: The Mongo URI of Cached Pages.

Running instances
=================

* [HackDash platform](http://hackdash.org): Create your own Dashboard for free. Maintained by the HackDash Creators.
* [Auth0 HackDash platform](http://safe-tor-9833.herokuapp.com/): Create a Dashboard for your company using Auth0 service.
* [BAHackaton](http://bahackaton.herokuapp.com): Buenos Aires City hackaton ideas.

Add your own Dashboard!


Contribute
==========

### Requirements
[NodeJS v0.10+](http://nodejs.org)  
[NPM v1.3+](http://npmjs.org/)  
[MongoDB v2.4+](http://mongodb.org)  
[GruntJS](http://gruntjs.com)  

### Create a configuration file
Create a `config.test.json` file using the config.json.sample with the configuration of your local for test. (i.e. mongoDB url for tests)

### Running Tests
```bash
npm install
npm test
```

or 

```bash
grunt test
```

Using a watcher while you develop

```bash
grunt watch
```
