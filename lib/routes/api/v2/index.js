
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

const app = Router();
export default app;

/**
 * Mount routers
 */

app.use('/', dashboard);
app.use('/', collections);
app.use('/', projects);
app.use('/', users);

