const cards = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getCard = (req, res, next) => {
  cards.find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner = req.user._id } = req.body;
  cards.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректный данные'));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((item) => {
      if (!item) { throw new NotFoundError('Карточка по указанному id не найдена'); }
      res.send(item);
    })
    .catch((err) => {
      if (err.statusCode === 404) { next(err); }
      if (err.name === 'CastError' || err.name === 'TypeError') {
        throw new BadRequestError('Переданы некорректные данные при удалении карточки');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((item) => {
      if (!item) { throw new NotFoundError('Карточка по указанному id не найдена'); }
      res.send(item);
    })
    .catch((err) => {
      if (err.statusCode === 404) { next(err); }
      if (err.name === 'CastError' || err.name === 'TypeError') {
        throw new BadRequestError('Переданы некорректные данные при удалении карточки');
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  cards.findById({ _id: req.params.cardId })
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (req.user._id.toString() === card.owner.toString()) {
        card.remove();
        res.status(200).send({ message: 'Карточка удалена' });
      }
      throw new ForbiddenError('Нельзя удалять чужую карточку');
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Карточка с указанным _id не найдена'));
      }
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Невалидный id'));
      }
      next(err);
    });
};