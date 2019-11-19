import Express from 'express';
import compression from 'compression';
import apiRouter from './routes/api.routes';
import integrationRouter from './routes/integration.routes';

// Initialize the Express App
const app = Express();

// External API integrations
app.use('/integrations', integrationRouter);

// Apply body Parser
app.use(compression());
app.use(Express.json({ limit: '20mb' }));
app.use(Express.urlencoded({ limit: '20mb', extended: false }));

app.use('/api', apiRouter);
// app.use(Express.static(path.resolve(__dirname, '../public/')));

export default app;
