import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
import process from 'process';

import getenv from './src/helpers/getenv.js';
import errorHandler from './src/middlewares/errorHandler.js';

import authRouter from './src/authRoute.js';
// import booksRouter from './src/routes/booksRoute.js';
// import borrowsRouter from './src/routes/borrowsRoute.js';
// import usersRouter from './src/routes/usersRoute.js';

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = getenv('MONGO_URI');

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin', // Optional, depending on your MongoDB setup
};

mongoose.set('strictQuery', true);
mongoose
  .connect(MONGO_URI, connectionOptions)
  .then(() => console.log('Connected to mongodb'))
  .catch((err) => {
    console.error(`Can't connect to mongodb`);
    console.error(err);
    process.exit(1);
  });

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: 10 * 1024 * 1024 }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('auth service');
});

app.use('/auth', authRouter);
// app.use('/books', booksRouter);
// app.use('/borrows', borrowsRouter);
// app.use('/users', usersRouter);

app.use(errorHandler);

app.listen(PORT, () => console.info(`Auth Service running on port ${PORT}`));
