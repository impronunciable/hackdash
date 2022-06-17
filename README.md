HackDash
========


Organize hackaton ideas into a dashboard

![HackDash Logo](http://i.imgur.com/XLQGF3y.png)

Install
===========

Hackdash can now be run in a docker container - see an example [dokku app configuration using ansible](https://github.com/OpenUpSA/ansible-config/tree/master/apps/hackdash).

Alternatively, see a [blog post](http://zajdband.com/installing-hackdash) explaining the installation process to run it natively. Also check the [wiki](https://github.com/danzajdband/hackdash/wiki) for more info and docs

Development enviroment
----------------------

The quickest way to set up a local development environment is by running

    docker-compose up

Once the images have been pulled/built and started, you should be able to visit it at http://localhost:3000 and see the prompt to create a new dashboard. Once you click in the dashboard name input, it will try and fail to prompt you to login.

To be able to login, create a `.env` file in the project root with the following config:

    GITHUB_CLIENT_ID=
    GITHUB_SECRET_KEY=
    GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

For the values of CLIENT_ID and SECRET_KEY, [create a Github OAuth app](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) with the above callback URL, and enter the ID and key values in the .ev file.

To apply the new environment variables to the running docker containers, stop them all and run `docker-compose up` again, or while they're running, run `docker-compose up -d` in another terminal.

You should now be able to login using your own github account via OAuth, and get redirected back to your local hackdash instance with a logged-in session. You can now create a dashboard and a project.


Config
======

Configure by setting environment variables, setting values in a `.env` file, or by modifying `config.js`.

| Environment variable or .env key | config.js key | Required | Default | Description |
|----------------------------------|---------------|----------|---------|-------------|
| `DATABASE_URL`                   | `db.url`      | Yes      |         | Overrides other db config. Full MongoDB URL. |
| `DB_HOST`                        | `db.host`     | If DATABASE_URL not provided |         |             |
| `DB_PORT`                        | `db.port`     | If DATABASE_URL not provided |         |             |
| `HOST`                           | `host`        | Yes      |         | Your instance host (i.e. yourdomain.com) |
| `PORT`                           | `port`        | No       | $PORT or 3000 | Your port (i.e. 3000) |
| `SESSION`                        | `session`     | Yes      |         | Your session key (it must be a secret string) |
| `TITLE`                          | `title`: Instance title used in the html title tag and other headings. |
| `LIVE`                           | `live`        | No       | true    | Boolean (true, false) that enable/disable the live feed feature in yourdomain.com/live.
| `MAILER`                         | `mailer`      | No       | `null`  | SMTP mail info to enable email notifications using nodemailer. Check out the [options](https://github.com/andris9/Nodemailer#setting-up-smtp) |
|                                  | `team`        | No       | ?       | An array of `user`.`_id` to be shown as Team on Landing Page. |
| `MAX_QUERY_LIMIT`                | `maxQueryLimit` | No     | 30      | a Number for the max amount of results at the landing page searchs. |
| `GOOGLE_ANALYTICS`               | `googleAnalytics` | No   | `UA-XXXXXXXX-X` | the UA-XXXXXXXX-X code from Google Analytics. if not specified wont set the script. |
| `FACEBOOK_APP_ID`                | `facebookAppId` | No     | `YYYYYYYYYYYY` | the Facebook App Id for share buttons. It will take first from keys.json, if not will use this one. Don't set it to not show FB share buttons. |
| `PRERENDER_ENABLE`               | `prerender.enabled` | No | `false` | Boolean (true, false). Where the website would use the SEO Prerender.|
| `PRERENDER_DB`                   | `db`          | No       | `"mongodb://localhost/prerender"` | The Mongo URI of Cached Pages.

Running instances
=================

* [HackDash platform](http://hackdash.org): Create your own Dashboard for free. Maintained by the HackDash Creators.
* [Auth0 HackDash platform](http://safe-tor-9833.herokuapp.com/): Create a Dashboard for your company using Auth0 service.
* [BAHackaton](http://bahackaton.herokuapp.com): Buenos Aires City hackaton ideas.

Add your own Dashboard!


Contribute
==========
Please check the [WIKI](https://github.com/danzajdband/hackdash/wiki)
