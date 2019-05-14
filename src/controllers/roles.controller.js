import AUTH_SCOPES from '../util/authScopes';

// Restrict students in these routes
export const allowSuperAdminOnly = (req, res, next) => {
  switch(req.jwtData.scope) {
    case AUTH_SCOPES.ALL:
    case AUTH_SCOPES.SUPERADMIN:
      next();
      break;
    default:
      res.status(403).send('You do not have admin privileges!');
  }
}
