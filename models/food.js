const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        index: true,
        required: true
    },

    price: {
        type: Number,
        min: 0,
        required: true
    }
});

module.exports = mongoose.model('Food', foodSchema);