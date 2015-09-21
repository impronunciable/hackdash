
/**
 * Metrics related routes
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import {isValidLink, setMetrics, sendCounts} from './controllers';
import {render} from 'lib/routes/helpers';

/**
 * Create and expose router
 */

const app = Router();
export default app;

/**
 * Generate routes
 */

app.get('/metrics', isValidLink, setMetrics, render('metrics'));
app.get('/counts', setMetrics, sendCounts);
