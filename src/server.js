import Express from 'express';
import compression from 'compression';
import apiRouter from './routes/api.routes';

// Initialize the Express App
const app = Express();

// Apply body Parser
app.use(compression());
app.use(Express.json({ limit: '20mb' }));
app.use(Express.urlencoded({ limit: '20mb', extended: false }));

app.use('/api', apiRouter);
// app.use(Express.static(path.resolve(__dirname, '../public/')));

export default app;
