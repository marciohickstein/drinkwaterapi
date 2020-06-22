const moongose = require('mongoose');

//[{"type":"glass","quantity":200,"time":"16:03:19"},{"type":"bottle","quantity":500,"time":"16:03:19"}]}

const consumptionSchema = new moongose.Schema({
    type: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
});

module.exports = moongose.model('Consumption', consumptionSchema);