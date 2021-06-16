const routerCards = require('express').Router();
const {
  getCard, createCard, likeCard, dislikeCard, deleteCard,
} = require('../controllers/cards');

routerCards.get('/cards', getCard);
routerCards.post('/cards', createCard);
routerCards.delete('/cards/:cardId', deleteCard);
routerCards.put('/cards/:cardId/likes', likeCard);
routerCards.delete('/cards/:cardId/likes', dislikeCard);

module.exports = routerCards;