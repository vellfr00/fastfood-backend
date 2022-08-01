const Order = require('../models/order');
const Food = require("../models/food");
const User = require("../models/user");
const debug = require("debug")('fastfood-backend:order-controller');

const { v4: uuidv4 } = require('uuid');

let listeningClients = [];
let listeningChefs = [];

const orderController = {
    getActiveOrders: (req, res, next) => {
        Order.find({status: "Ricevuto"})
            .then(document => {
                res.status(200);

                res.locals.success = true;
                res.locals.data = document;

                next();
            }).catch(error => {
                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    getAssignedOrder: (req, res, next) => {
        Order.findOne({status: "Preso in Carico", chef: req.user._id})
            .then(order => {
                if(!order) {
                    res.status(404);

                    res.locals.success = false;
                    res.locals.data = {message: "Nessun ordine attivo in carico a questo chef"};

                    next(new Error("Nessun ordine attivo in carico a questo chef"));
                } else {
                    Order.populate(order.content, "food")
                        .then(orderData => {
                            order.content = orderData;
                            res.status(200);

                            res.locals.success = true;
                            res.locals.data = order;

                            next();
                        }).catch(error => {
                            res.status(500);

                            res.locals.success = false;
                            res.locals.data = {message: error.message};

                            next(error);
                    });
                }
            }).catch(error => {
                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    getOrder: (req, res, next) => {
        Order.findOne({orderid: req.params.orderid})
            .then(document => {
                if(!document) {
                    res.status(404);

                    res.locals.success = false;
                    res.locals.data = {message: "Ordine non trovato"};

                    next(new Error("Ordine non trovato"));
                } else {
                    Order.populate(document.content, "food")
                        .then(orderData => {
                            document.content = orderData;
                            User.findById(document.chef).then(chef => {
                                if(chef) {
                                    const newDoc = {...document._doc, chef_username: chef.username, chef_firstname: chef.firstname, chef_lastname: chef.lastname}
                                    res.status(200);

                                    res.locals.success = true;
                                    res.locals.data = newDoc;

                                    next();
                                } else {
                                    res.status(200);

                                    res.locals.success = true;
                                    res.locals.data = document;

                                    next();
                                }
                            });
                        }).catch(error => {
                        res.status(500);

                        res.locals.success = false;
                        res.locals.data = {message: error.message};

                        next(error);
                    });
                }
            }).catch(error => {
                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    registerOrder: async (req, res, next) => {
        let contentObjects = req.body.name.map((id, index) => {
            return {food: id, quantity: req.body.quantity[index]}
        });

        res.locals.total = 0;
        for (const item of contentObjects) {
            const document = await Food.findById(item.food);

            if (!document) {
                res.status(400);

                res.locals.success = false;
                res.locals.data = {message: "Una o più pietanze non esistono"};

                next(new Error("Una o più pietanze non esistono"));
            }

            res.locals.total += document.price * item.quantity;
        }

        const newOrder = new Order({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            date: new Date(),
            table: req.body.table,
            status: "Ricevuto",
            content: contentObjects
        });

        newOrder.save()
            .then(document => {
                listeningChefs.forEach(chef => {
                    let msg = 'event: order\ndata: ' + JSON.stringify(document) + '\n\n';
                    chef.response.write(msg);
                });

                res.status(200);

                res.locals.success = true;
                res.locals.data = document;

                next();
            }).catch(error => {
            debug("Errore nella creazione di un nuovo ordine: " + error);

            res.status(500);

            res.locals.success = false;
            res.locals.data = {message: error.message};

            next(error);
        });
    },

    updateOrder: (req, res, next) => {
        Order.findOneAndUpdate({'$or': [{orderid: req.params.orderid, chef: {'$exists': false}}, {orderid: req.params.orderid, chef: req.user._id}]},
            {status: req.body.status, chef: req.user._id}, {new: true, runValidators: true})
            .then(document => {
                if(!document) {
                    res.status(404);

                    res.locals.success = false;
                    res.locals.data = {message: "Ordine non trovato oppure già preso in carico da un altro chef"};

                    next(new Error("Ordine non trovato oppure già preso in carico da un altro chef"));
                } else {
                    listeningClients.forEach(listeningClient => {
                        if(listeningClient.orderid === req.params.orderid) {
                            let msg = 'event: status\ndata: {"status": "' + document.status + '", "firstname": "' + req.user.firstname + '", "lastname": "' + req.user.lastname + '"}\n\n';
                            listeningClient.response.write(msg);
                        }
                    });

                    res.status(200);

                    res.locals.success = true;
                    res.locals.data = document;

                    next();
                }
            }).catch(error => {
                debug("Impossibile modificare lo stato dell'ordine: " + error);

                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    registerForOrderUpdate: (req, res, next) => {
        let uuid = uuidv4();

        listeningClients.push({
            id: uuid,
            orderid: req.params.orderid,
            response: res
        });

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };

        res.writeHead(200, headers);
        let msg = 'event: id\ndata: {"id": "' + uuid + '"}\n\n';
        res.write(msg);
    },

    unregisterForOrderUpdate: (req, res, next) => {
        let i = listeningClients.findIndex(e => {
            return e.id === req.params.id;
        });

        if(i !== -1) {
            listeningClients[i].response.end();
            listeningClients.splice(i, -1);
        }

        res.send(200);
        res.end();
    },

    registerForNewOrders: (req, res, next) => {
        let uuid = uuidv4();

        listeningChefs.push({
            id: uuid,
            response: res
        });

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };

        res.writeHead(200, headers);
        let msg = 'event: id\ndata: {"id": "' + uuid + '"}\n\n';
        res.write(msg);
    },

    unregisterForNewOrders: (req, res, next) => {
        let i = listeningChefs.findIndex(e => {
            return e.id === req.params.id;
        });

        if(i !== -1) {
            listeningChefs[i].response.end();
            listeningChefs.splice(i, -1);
        }

        res.send(200);
        res.end();
    }
}

module.exports = orderController;