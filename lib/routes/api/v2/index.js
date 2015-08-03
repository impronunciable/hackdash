
/*
 * RESTfull API
 *
 *
 */

var app = module.exports = require('express').Router();
var passport = require('passport')
  , mongoose = require('mongoose')
  , config = require('../../../config.json');

app.use('/', require('./dashboard'));
app.use('/', require('./collections'));
app.use('/', require('./projects'));
app.use('/', require('./users'));

