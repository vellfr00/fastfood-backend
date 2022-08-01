const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },

    lastname: {
        type: String,
        required: true
    },

    date: Date,
    table: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: {
            values: ["Ricevuto", "Preso in Carico", "Pronto"],
            message: "{VALUE} non supportato"
        }
    },

    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    content: [{
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food"
        },

        quantity: Number
    }]
});

orderSchema.plugin(AutoIncrement, {inc_field: 'orderid'}); // Incremento automatico

module.exports = mongoose.model('Order', orderSchema);