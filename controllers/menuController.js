const Food = require('../models/food');

const debug = require('debug')('fastfood-backend:admin-controller');

const menuController = {
    getMenu: (req, res, next) => {
        Food.find({})
            .then(data => {
                res.status(200);

                res.locals.success = true;
                res.locals.data = data;

                next();
            }).catch(error => {
                debug("Errore nell'ottenimento del menu: " + error);

                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    addFood: (req, res, next) => {
        const newFood = new Food({
            name: req.body.name,
            price: req.body.price
        });

        newFood.save()
            .then(document => {
                res.status(200);

                res.locals.success = true;
                res.locals.data = document;

                next();
            }).catch(error => {
                debug("Errore nell'aggiunta della pietanza: " + error);

                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    deleteFood: (req, res, next) => {
        Food.deleteOne({name: req.body.name})
            .then(() => {
                res.status(200);

                res.locals.success = true;
                res.locals.data = {name: req.body.name};

                next();
            }).catch(error => {
                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    },

    updateFood: (req, res, next) => {
        let oldName = req.body.name;

        Food.findOneAndUpdate({name: oldName}, {name: req.body.newname, price: req.body.newprice}, {new: true, runValidators: true})
            .then(data => {
                if(data == null) {
                    res.status(404);

                    res.locals.success = false;
                    res.locals.data = {message: "Impossibile trovare la pietanza specificata"};

                    next(new Error("Impossibile trovare la pietanza specificata"))
                }

                res.status(200);

                res.locals.success = true;
                res.locals.data = {oldDocument: oldName, newDocument: data};

                next();
            }).catch(error => {
                debug("Impossibile modificare la pietanza " + oldName);

                res.status(500);

                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
        });
    }
}

module.exports = menuController;