
/**
 * Module dependencies
 */

import {Collection} from 'lib/models';
import {maxQueryLimit=50} from 'config';

/**
 * Module scope constants
 */

const USER_PVT = '-__v -email -provider_id';
const MAX_LIMIT = maxQueryLimit;

/**
 * Routes helpers
 */

export const setQuery = (req, res, next) => {
  const query = req.query.q || '';
  req.limit = req.query.limit || MAX_LIMIT;

  if (req.limit > MAX_LIMIT){
    req.limit = MAX_LIMIT;
  }

  req.search_query = {};

  if (query.length === 0){
    return next();
  }

  const regex = new RegExp(query, 'i');
  req.search_query.$or = [ { title: regex }, { description: regex } ];
  next();
};

export const getAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find(req.search_query || {})
      .select('-__v')
      .limit(req.limit || MAX_LIMIT)
      .sort( { 'created_at' : -1 } )
      .populate('owner', USER_PVT)
      .populate('dashboards')
      .exec();
    req.collections = collections || [];
    next();
  } catch(err) {
    res.send(500);
  }
};

export const getUserCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ 'owner': req.user._id })
      .select('-__v')
      .populate('owner', USER_PVT)
      .populate('dashboards')
      .exec();
    req.collections = collections || [];
    next();
  } catch(err) {
    res.send(500)
  }
};

export const getCollection = async (req, res, next) => {
  try {
    const collection = Collection.findById(req.params.cid)
      .select('-__v')
      .populate('owner', USER_PVT)
      .populate('dashboards')
      .exec();

    if (!collection) return res.send(404);
    req.collection = collection;
    next();
  } catch(err) {
    res.send(500);
  }
};

export const isOwner = ({user, collection}, res, next) => 
  user.id === collection.owner.id ? next() : res.send(403, 'Only Owner can modify this collection.');

export const createCollection = async ({body, user}, res, next) => {
  let collection = new Collection({
    title: body.title,
    description: body.description,
    owner: user._id,
    created_at: Date.now()
  });

  try {
    collection = await collection.save().exec();
    req.collection = collection;
  } catch(err) {
    res.send(500);
  }
};

export const updateCollection = async ({collection, body}, res) => {
  const getValue = prop => body.hasOwnProperty(prop) ? body[prop] : collection[prop];

  collection.title = getValue('title');
  collection.description = getValue('description');

  try {
    await collection.save().exec();
    res.send(204);
  } catch(err) {
    res.send(500);
  }
};

export const removeCollection = async (req, res) => {
  try {
    await req.collection.remove().exec();
    res.send(204);
  } catch(err) {
    res.send(500, 'An error ocurred when removing this collection');
  }
};

export const addDashboard = async ({collection, params}, res) => {
  try {
    await Collection.update({ _id: collection.id }, { $addToSet : { 'dashboards': params.did }}).exec();
    res.send(204);
  } catch(err) {
    res.send(500);
  }
};

export const removeDashboard = async ({collection, params}, res, next) => {
  try {
    await Collection.update({ _id: collection.id }, { $pull : { 'dashboards': params.did }}).exec();
    res.send(204);
  } catch(err) {
    res.send(500);
  }
};

export const sendCollections = (req, res) => res.send(req.collections);
export const sendCollection = (req, res) => res.send(req.collection);
