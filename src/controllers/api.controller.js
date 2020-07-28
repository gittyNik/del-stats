import apidocSwagger from 'apidoc-swagger';

export const getSwagger = (req, res) => {
  const src = `${__dirname}/../../src`;
  const swagger = apidocSwagger(src);
  res.send(swagger);
};

export const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    res.sendStatus(404);
  } else {
    next();
  }
};

export const browserAccessControl = (req, res, next) => {
  const allowedOrigins = process.env.WEB_SERVER.split(",");
  let origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
  }
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');

  // Send `No Content` to preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
};

export const send404 = (req, res) => res.sendStatus(404);

export const sendSampleResponse = (req, res) => res.send('Delta API');

export const apiNotReady = (req, res) => res.status(405).send('This url endpoint is recognized, but not implemented/ready yet. It will be available in future versions of the API');

export default sendSampleResponse;
