//{"start":"10:30","end":"22:00","interval":"00:01"}

const moongose = require('mongoose');

const notificationSchema = new moongose.Schema({
    id: {
        type: Number,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    interval: {
        type: String,
        required: true
    },
});

module.exports = moongose.model('Notification', notificationSchema);