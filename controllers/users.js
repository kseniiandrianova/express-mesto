const validator = require('validator');
const users = require('../models/user');

module.exports.getUsers = (req, res) => {
  users.find({})
    .then((items) => {
      res.status(200).send({ data: items });
    })
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};
module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  return users.findById(userId)
    .then((user) => {
      if (user) {
        return res.status(200).send({
          name: user.name, about: user.about, avatar: user.avatar, _id: user._id,
        });
      }
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch(() => {
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  users.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      validator(res, err, 'Переданы некорректные данные при создании пользователя.');
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  users.findByIdAndUpdate(owner, { name, about }, { runValidators: true })
    .then((user) => {
      if (user) { return res.status(200).send({ data: user }); }
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      validator(res, err, 'Переданы некорректные данные при обновлении профиля.');
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const owner = req.user._id;
  users.findByIdAndUpdate(owner, { avatar }, { runValidators: true })
    .then((user) => {
      if (user) { return res.status(200).send({ data: user }); }
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      validator(res, err, 'Переданы некорректные данные при обновлении аватара.');
    });
};