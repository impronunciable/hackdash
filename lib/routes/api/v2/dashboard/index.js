
/**
 * RESTfull API: Dashboard Resources
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import cors from 'cors';
import {isAuth, notAllowed} from 'lib/routes/api/v2/helpers';
import {validateSubdomain, createDashboard, sendDashboard, sendDashboards, setQuery,
setDashboard, setDashboards, getDashboard, isAdminDashboard, sendDashboardCSV, setFullOption,
updateDashboard, isOwnerDashboard, removeDashboard} from './controllers';

/**
 * Expose router
 */

const app = Router();
export default app;

/**
 * Create routes
 */

app.post('/dashboards', isAuth, validateSubdomain, createDashboard, sendDashboard);
app.get('/dashboards', cors(), setQuery, setDashboards, sendDashboards);

app.get('/dashboards/:domain/csv', isAuth, getDashboard, isAdminDashboard, sendDashboardCSV);

app.get('/dashboards/:domain', cors(), getDashboard, sendDashboard);
app.get('/', getDashboard, sendDashboard);

app.put('/dashboards/:domain', isAuth, getDashboard, isAdminDashboard, updateDashboard, sendDashboard);
app.put('/', isAuth, getDashboard, isAdminDashboard, updateDashboard, sendDashboard);

app.delete('/dashboards/:domain', isAuth, getDashboard, isOwnerDashboard, removeDashboard);

app.post('/', notAllowed);
app.delete('/', notAllowed);
