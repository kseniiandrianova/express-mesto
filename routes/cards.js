const routerCards = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCard, createCard, likeCard, dislikeCard, deleteCard,
} = require('../controllers/cards');

routerCards.get('/cards', getCard);

routerCards.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().pattern(/http(s)?:\/\/(www\.)?[a-zA-Z0-9-._~:\/?#[\]@!$&'()*\+,;=]{2,256}\.[a-z]{2,6}([a-zA-Z0-9-._~:\/?#[\]@!$&'()*\+,;=]{1,})?/),
  }),
}), createCard);

routerCards.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), deleteCard);

routerCards.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), likeCard);

routerCards.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24).hex(),
  }),
}), dislikeCard);

module.exports = routerCards;