const Transaction = require('../models/transaction');
const Order = require('../models/order');

const transactionController = {
    getTransactions: (req, res, next) => {
        Transaction.find({}).populate('order')
            .then(data => {
                if(!data) {
                    res.status(404);

                    res.locals.success = false;
                    res.locals.data = {message: "Transazioni non trovate"};

                    next(new Error("Transazioni non trovate"));
                }

                res.status(200);

                res.locals.success = true;
                res.locals.data = data;

                next();
            }).catch(error => {
                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    registerTransaction: (req, res, next) => {
        const newTransaction = new Transaction({
            order: res.locals.data,
            total: res.locals.total
        });

        newTransaction.save()
            .then(document => {
                next();
            }).catch(error => {
                //Eliminiamo l'ordine
                Order.deleteOne({_id: res.locals.data._id});

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    }
};

module.exports = transactionController;