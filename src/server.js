import Express from 'express';
import compression from 'compression';
import apiRouter from './routes/api.routes';
import integrationRouter from './routes/integrations';

// Initialize the Express App
const app = Express();

// Use it before because slack/events-api has an issue with the body-parser
// External API integrations
app.use('/integrations', integrationRouter);

// Apply body Parser
app.use(compression());
app.use(Express.json({ limit: '20mb' }));
app.use(Express.urlencoded({ limit: '20mb', extended: false }));

app.use('/api', apiRouter);
// app.use(Express.static(path.resolve(__dirname, '../public/')));

export default app;
