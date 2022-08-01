const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

morgan.token('body', req => {
    return JSON.stringify(req.body)
});

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :body'))
app.use(express.urlencoded({ extended: false }));

const debug = require('debug')('fastfood-backend:server');

// Import ed inizializzazione di Passport.js

const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");

app.use(expressSession({
    secret: "tHiSiSasEcRetStr",
    resave: true,
    saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---


// Import ed inizializzazione database

const mongoose = require('mongoose');
//mongoose.connect("mongodb://localhost:27017/fastfood", {useNewUrlParser: true});
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

db.once("open", () => debug("Connessione con il database avvenuta con successo"));

// ---

// Routers

const apiRouter = require('./routes/api');

app.use('/api', apiRouter);

// ---

module.exports = app;

