const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const routesUser = require('./routes/users');
const routesCards = require('./routes/cards');
const router = require('./routes/index');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errors());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(routesUser);
app.use(routesCards);
app.use(router);
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
});

app.disable('x-powered-by');

app.listen(PORT);