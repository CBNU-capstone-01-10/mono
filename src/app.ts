import express from 'express';
import sessionConfig from './config/session.config';
import session from 'express-session';
import NotFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';
import authMiddleware from './middleware/auth';
const app = express();

app.set('view engine', 'ejs');
app.use(session(sessionConfig));

//urlencoded body parser
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

//serve statics
app.use(express.static(`${process.cwd()}/public`));
app.use(express.static(`${process.cwd()}/uploads`));

//import routers
import { accountRouter, actionRouter, userRouter } from './routes';

//use router
app.use('/', accountRouter);
app.use('/actions', authMiddleware, actionRouter);
app.use('/users', authMiddleware, userRouter);
//response 404 for any request to unknown endpoint
app.use('*', NotFound);

//error handler
app.use(errorHandler);

export default app;
