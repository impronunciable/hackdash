HackDash
========

Organize hackaton ideas into a dashboard

![HackDash Logo](http://i.imgur.com/XLQGF3y.png)

Install
===========

I wrote a [blog post](http://zajdband.com.ar/installing-hackdash) explaining the installation process.

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

Running instances
=================

* [HackDash platform](http://hackdash.org): Create your own Dashboard for free. Maintained by the HackDash Creators.
* [Auth0 HackDash platform](http://safe-tor-9833.herokuapp.com/): Create a Dashboard for your company using Auth0 service.
* [BAHackaton](http://bahackaton.herokuapp.com): Buenos Aires City hackaton ideas.

Add your own Dashboard!
