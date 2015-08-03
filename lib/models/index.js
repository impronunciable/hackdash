
/**
 * Database connection and models definition. It takes care of the app data
 */

/**
 * Module dependencies
 */

import mongoose from 'mongoose';
import {db} from 'config';

import UserSchema from './user';
import ProjectSchema from './project';
import DashboardSchema from './dashboard';
import CollectionSchema from './collection';

/**
 * Module scope constants
 */

const {Schema, model, connect} = mongoose;

/*
 * DB Connection
 */

connect(db.url || (`mongodb://${db.host}/${db.name}));

/**
 * Models declaration
 */

export const User = model('User', new Schema(UserSchema));
export const Project = model('Project', new Schema(ProjectSchema));
export const Dashboard = model('Dashboard', new Schema(DashboardSchema));
export const Collection = model('Collection', new Schema(CollectionSchema));
