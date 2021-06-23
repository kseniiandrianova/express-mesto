const routerUsers = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, updateProfile, updateAvatar, getUserId,
} = require('../controllers/users');

const validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
});

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string()
      .required()
      .regex(/^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w\W.-]*)#?$/),
  }),
});

routerUsers.get('/users', getUsers);
routerUsers.get('/users/:userId', getUser);
routerUsers.get('/:id', getUserId, validateId);
routerUsers.patch('/users/me', updateProfile, validateUpdateProfile);
routerUsers.patch('/users/me/avatar', updateAvatar, validateAvatar);
module.exports = routerUsers;