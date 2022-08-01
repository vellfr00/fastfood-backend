const express = require('express');
const orderRouter = express.Router();

const orderController = require('../controllers/orderController');
const respondController = require('../controllers/responseController');
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');

orderRouter.get('/active', userController.verifyJWT, userController.verifyIsChef, orderController.getActiveOrders, respondController.responseJSON);
orderRouter.get('/assigned', userController.verifyJWT, userController.verifyIsChef, orderController.getAssignedOrder, respondController.responseJSON);
orderRouter.get('/new', userController.verifyJWT, userController.verifyIsChef, orderController.registerForNewOrders);
orderRouter.get('/:orderid', orderController.getOrder, respondController.responseJSON);
orderRouter.get('/update/:orderid', orderController.registerForOrderUpdate);

orderRouter.post('/', orderController.registerOrder, transactionController.registerTransaction, respondController.responseJSON);
orderRouter.post('/update/:orderid', userController.verifyJWT, userController.verifyIsChef, orderController.updateOrder, respondController.responseJSON);
orderRouter.post('/update-unsubscribe/:id', orderController.unregisterForOrderUpdate);
orderRouter.post('/new-unsubscribe/:id', orderController.unregisterForNewOrders);

module.exports = orderRouter;