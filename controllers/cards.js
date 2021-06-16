const cards = require('../models/card');

const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;

module.exports.getCard = (req, res) => {
  cards.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link, owner = req.user._id } = req.body;
  cards.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при создании карточки' });
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) return res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      res.status(500).send(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send({ data: card });
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res) => {
  const owner = req.user._id;
  cards.findOneAndDelete({ _id: req.params.cardId, owner })
    .then((card) => {
      if (card) {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') return res.status(ERROR_CODE_404).send({ message: 'Карточка с указанным _id не найдена' });
      res.status(500).send(err);
    });
};