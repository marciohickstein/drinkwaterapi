const express = require('express');
const router = express.Router();
const {logRequest, showRequest, parserData, getDate} = require('../utils')
const {readFile} = require('fs');

var DEFAULT_NOTIFICATION_START = '08:30';
var DEFAULT_NOTIFICATION_END = '22:30';

function getHour(time){
    return parseInt(time.split(':')[0]);
}

function getMinute(time){
    console.log(time);
    return parseInt(time.split(':')[1]);
}

router.get("/", (req, res) => {
    showRequest(req);

    readFile("notification.json", (err, data) => {
        let notification = err ? {} : parserData(data);
        let reminder = {};
        console.log("notification: "+ notification);
        if (notification)
        {
            let date = getDate();
            let minutes = date.getHours() * 60 + date.getMinutes();
            let startMinutes = getHour(notification.start ? notification.start : DEFAULT_NOTIFICATION_START) * 60 + getMinute(notification.start ? notification.start : DEFAULT_NOTIFICATION_START);
            let endMinutes = getHour(notification.end ? notification.end : DEFAULT_NOTIFICATION_END) * 60 + getMinute(notification.end ? notification.end : DEFAULT_NOTIFICATION_END);
            
            console.log(`Agora (min): ${minutes}, Inicio (min): ${startMinutes}, Fim (min): ${endMinutes}`);
            reminder.interval = notification.interval;
            if (minutes >= startMinutes && minutes <= endMinutes)
                reminder.message = "Lembrete: Não esqueça de beber a sua água!";
            else
                console.log("Nada para lembrar!");
        }
        console.log(`Send: ${JSON.stringify(reminder)}`);
        res.json(reminder);
    });
});

module.exports.routerReminder = router;
