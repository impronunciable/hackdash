
/**
 * Routes main router. This router will mount the different parts of the app
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import api from './api/v2';
import site from './site';
import admin from './admin';
import metrics from './metrics';

/**
 * Create router
 */

const app = Router();
export default app;

/**
 * Mount app routers
 */

app.use('/api/v2', api);
app.use('/', site);
app.use('/', admin);
app.use('/', metrics);
