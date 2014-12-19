
var CronJob = require('cron').CronJob;
var load = require('./load');

var cronTime = require('./config').cronTime || "00 00 11 * * 1-5";

(new CronJob(cronTime, load)).start();
load();
