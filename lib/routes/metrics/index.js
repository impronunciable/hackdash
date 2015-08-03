
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

export default const app = Router();

/**
 * Generate routes
 */

app.get('/metrics', isValidLink, setMetrics, render('metrics'));
app.get('/counts', setMetrics, sendCounts);
