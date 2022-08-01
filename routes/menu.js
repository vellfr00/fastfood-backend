const express = require('express');
const menuRouter = express.Router();

const userController = require('../controllers/userController');
const menuController = require('../controllers/menuController');
const respondJSON = require('../controllers/responseController')

menuRouter.post('/add', userController.verifyJWT, userController.verifyIsAdmin, menuController.addFood, respondJSON.responseJSON);
menuRouter.post('/delete', userController.verifyJWT, userController.verifyIsAdmin, menuController.deleteFood, respondJSON.responseJSON);
menuRouter.post('/update', userController.verifyJWT, userController.verifyIsAdmin, menuController.updateFood, respondJSON.responseJSON);
menuRouter.get('/', menuController.getMenu, respondJSON.responseJSON);

module.exports = menuRouter;