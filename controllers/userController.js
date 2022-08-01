const User = require('../models/user');
const jsonWebToken = require('jsonwebtoken');

const debug = require('debug')('fastfood-backend:user-controller');

const passport = require('passport');

const secretKey = "secret_pass";

const userController = {
    registerUser: (req, res, next) => {
        const newUser = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            role: req.body.role
        });

        User.register(newUser, req.body.password, (error, user) => {
            if(user) {
                res.status(200);
                res.locals.success = true;
                res.locals.data = {};

                next();
            } else {
                debug("Errore nella registrazione nuovo utente: " + error);

                res.status(400);
                res.locals.success = false;
                res.locals.data = {message: error.message};

                next(error);
            }
        });
    },

    authenticateUser: (req, res, next) => {
        passport.authenticate("local", {session: false}, (error, user) => {
            if(user) {
                let signedToken = jsonWebToken.sign(
                    {
                        data: user._id,
                        exp: new Date().setDate(new Date().getDate() + 1)
                    },
                    secretKey
                );

                res.status(200);
                res.locals.success = true;
                res.locals.data = {token: signedToken, firstname: user.firstname, lastname: user.lastname, role: user.role};

                next();
            } else {
                res.status(401);
                res.locals.success = false;
                res.locals.data = {message: "Username o password errati"};

                next(error);
            }
        })(req, res, next);
    },

    verifyJWT: (req, res, next) => {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if(token) {
            jsonWebToken.verify(token, secretKey, (error, payload) => {
                if(payload) {
                    User.findById(payload.data).then(user => {
                        if(user) {
                            // AUTENTICATO

                            req.user = user;
                            next();
                        } else {
                            res.status(403);

                            res.locals.success = false;
                            res.locals.data = {message: "Account utente non trovato"};

                            next(error);
                        }
                    });
                } else {
                    res.status(401);

                    res.locals.success = false;
                    res.locals.data = {message: "Impossibile verificare il token"};

                    next(error);
                }
            });
        } else {
            res.status(401);

            res.locals.success = false;
            res.locals.data = {message: "Token richiesto"};

            next(new Error("Token richiesto"));
        }
    },

    verifyIsAdmin: (req, res, next) => {
        if(req.user.role === "admin") {
            next();
        } else {
            res.status(401);

            res.locals.success = false;
            res.locals.data = {message: "L'utente non è un amministratore"};

            next(new Error("L'utente non è un amministratore"));
        }
    },

    verifyIsChef: (req, res, next) => {
        if(req.user.role === "chef") {
            next();
        } else {
            res.status(401);

            res.locals.success = false;
            res.locals.data = {message: "L'utente non è uno chef"};

            next(new Error("L'utente non è uno chef"));
        }
    },

    getUser: (req, res, next) => {
        res.status(200);

        res.locals.success = true;
        res.locals.data = {firstname: req.user.firstname, lastname: req.user.lastname, role: req.user.role};

        next();
    }
};

module.exports = userController;