const express = require('express');
const apiRouter = express.Router();

const usersRouter = require('./user');
const menuRouter = require('./menu');
const orderRouter = require('./order');
const transactionRouter = require('./transaction');

const responseController = require('../controllers/responseController');

apiRouter.use('/users', usersRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/transactions', transactionRouter);

apiRouter.use(responseController.errorJSON);

module.exports = apiRouter;