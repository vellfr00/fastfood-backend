const express = require('express');
const transactionRouter = express.Router();

const transactionController = require('../controllers/transactionController');
const userController = require('../controllers/userController');
const respondController = require('../controllers/responseController');

transactionRouter.get('/', userController.verifyJWT, userController.verifyIsAdmin, transactionController.getTransactions, respondController.responseJSON);

module.exports = transactionRouter;