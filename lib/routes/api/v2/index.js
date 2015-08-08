
/*
 * RESTfull API
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import dashboard from './dashboard';
import collections from './collections';
import projects from './projects';
import users from './users';

/**
 * Expose app
 */

export default const app = Router();

/**
 * Mount routers
 */

app.use('/', dashboard);
app.use('/', collections);
app.use('/', projects);
app.use('/', users);

