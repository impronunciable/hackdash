
/**
 * Generic route helpers
 */

export const notAllowed = (req, res) => res.send(405);
export const isAuth = (req, res, next) => req.isAuthenticated() ? next(): res.send(401, 'User not authenticated');
