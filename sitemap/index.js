
var CronJob = require('cron').CronJob;
var generate = require('./generator');

var cronTime = require('./config').cronTime || "00 00 11 * * 1-5";

(new CronJob(cronTime, generate)).start();
generate();
