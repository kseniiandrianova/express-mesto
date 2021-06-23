const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getUsers = (req, res, next) => {
  users.find({})
    .then((items) => {
      res.status(200).send({ data: items });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};
module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  return users.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send({
        name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректный данные'));
      } else if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.getUserId = (req, res, next) => {
  users.findById(req.params.id)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    users.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(200).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректный данные'));
        } else if (err.name === 'MongoError' && err.code === 11000) {
          next(new ConflictError('Пользователь с таким email уже существует!'));
        }
        next(err);
      });
  });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  users.findByIdAndUpdate(owner, { name, about }, { runValidators: true }, { new: true })
    .then((user) => {
      if (user) { return res.status(200).send({ data: user }); }
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const owner = req.user._id;
  users.findByIdAndUpdate(owner, { avatar }, { runValidators: true }, { new: true })
    .then((user) => {
      if (user) { return res.status(200).send({ data: user }); }
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return users.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      }).send({ token });
      next();
    })
    .catch(next);
};