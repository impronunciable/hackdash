
/**
 * This is the router for app installation. It sets the first admin
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import {isAuth, render} from 'lib/routes/helpers'; 
import {notInstalled} from './controllers';

/**
 * Create and expose router
 */

export default const app = Router();

/**
 * Admin routes
 */

app.get('/install', isAuth, notInstalled, render('installed'));

