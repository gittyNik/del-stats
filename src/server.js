import Express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import path from 'path';
import apiRouter from './routes/api.routes';

// Initialize the Express App
const app = new Express();

// Apply body Parser
app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));


app.use('/api', apiRouter);
// app.use(Express.static(path.resolve(__dirname, '../public/')));

export default app;
