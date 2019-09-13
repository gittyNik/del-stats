export const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    res.sendStatus(404);
  } else {
    next();
  }
};

export const browserAccessControl = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.WEB_SERVER);
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');

  // Send `No Content` to preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
};
