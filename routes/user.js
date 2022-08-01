const express = require('express');
const usersRouter = express.Router();

const userController = require('../controllers/userController');
const respondJSON = require('../controllers/responseController');

usersRouter.get('/', userController.verifyJWT, userController.getUser, respondJSON.responseJSON);
usersRouter.post('/register', userController.registerUser, respondJSON.responseJSON);
usersRouter.post('/auth', userController.authenticateUser, respondJSON.responseJSON);

module.exports = usersRouter;