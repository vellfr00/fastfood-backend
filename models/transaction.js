const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },

    total: Number
});

module.exports = mongoose.model('Transaction', transactionSchema);