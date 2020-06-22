const mongoose = require('mongoose');

const perfilSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwd: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Perfil', perfilSchema);