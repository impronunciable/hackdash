/*
 * RESTfull API: Collection Resources
 * 
 * 
 */

var passport = require('passport')
  , mongoose = require('mongoose')
  , _ = require('underscore')
  , config = require('../../../config.json');

var Collection = mongoose.model('Collection');

module.exports = function(app, uri, common) {

  // Get & Search all collections
  app.get(uri + '/collections', setQuery, getAllCollections, sendCollections);

  // Get user collections
  app.get(uri + '/collections/own', getUserCollections, sendCollections);

  // Create a user collection
  app.post(uri + '/collections', common.isAuth, createCollection, sendCollection);

  // Get a collection
  app.get(uri + '/collections/:cid', getCollection, sendCollection);

  // Update a user collection
  app.put(uri + '/collections/:cid', common.isAuth, getCollection, isOwner, updateCollection);

  // Delete a user collection
  app.del(uri + '/collections/:cid', common.isAuth, getCollection, isOwner, removeCollection);

  // Add dashboard to a collection
  app.post(uri + '/collections/:cid/dashboards/:did', common.isAuth, getCollection, isOwner, addDashboard);

  // Remove dashboard from a collection
  app.del(uri + '/collections/:cid/dashboards/:did', common.isAuth, getCollection, isOwner, removeDashboard);

};

var setQuery = function(req, res, next){
  var query = req.query.q || "";

  req.search_query = {};

  if (query.length === 0){
    return next();
  }

  var regex = new RegExp(query, 'i');
  req.search_query.$or = [ { title: regex }, { description: regex } ];

  next();
};

var getAllCollections = function(req, res, next){
  
  Collection.find(req.search_query || {})
    .limit(30)
    .sort( { "created_at" : -1 } )
    .populate('owner')
    .populate('dashboards')
    .exec(function(err, collections) {
      if(err) return res.send(500);
      req.collections = collections || [];
      next();
    });
};

var getUserCollections = function(req, res, next){
  Collection.find({ "owner": req.user._id })
    .populate('owner')
    .populate('dashboards')
    .exec(function(err, collections) {
      if(err) return res.send(500);
      req.collections = collections || [];
      next();
    });
};

var getCollection = function(req, res, next){
  Collection.findById(req.params.cid)
    .populate('owner')
    .populate('dashboards')
    .exec(function(err, collection) {
      if (err) return res.send(500);
      if (!collection) return res.send(404);

      req.collection = collection;
      next();
  });
};

var isOwner = function(req, res, next){
  var isOwner = req.user.id === req.collection.owner.id;
  
  if (!isOwner) {
    return res.send(403, "Only Owner can modify this collection.");
  }

  next();
};

var createCollection = function(req, res, next){
    
  var collection = new Collection({
      title: req.body.title
    , description: req.body.description
    , created_at: Date.now()
    , owner: req.user._id
  });

  collection.save(function(err, collection){
    if(err) return res.send(500); 
    req.collection = collection;
    next();
  });
};

var updateCollection = function(req, res){
  var collection = req.collection;

  function getValue(prop){
    return req.body.hasOwnProperty(prop) ? req.body[prop] : collection[prop];    
  }

  collection.title = getValue("title");
  collection.description = getValue("description");
  
  collection.save(function(err, collection){
    if(err) return res.send(500);
    res.send(204);
  });
};

var removeCollection = function(req, res){
  req.collection.remove(function (err){
    if (err) return res.send(500, "An error ocurred when removing this collection");
    res.send(204);
  });
};

var addDashboard = function(req, res, next){
  var collectionId = req.collection.id;
  var dashboardId = req.params.did;

  Collection.update({ _id: collectionId }, { $addToSet : { 'dashboards': dashboardId }}, function(err){
    if(err) return res.send(500);
    res.send(204);
  });
};

var removeDashboard = function(req, res, next){
  var collectionId = req.collection.id;
  var dashboardId = req.params.did;

  Collection.update({ _id: collectionId }, { $pull : { 'dashboards': dashboardId }}, function(err){
    if(err) return res.send(500);
    res.send(204);
  });
};

var sendCollections = function(req, res){
  res.send(req.collections);
};

var sendCollection = function(req, res){
  res.send(req.collection);
};
