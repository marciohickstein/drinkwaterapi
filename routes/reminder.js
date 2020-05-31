const express = require('express');
const router = express.Router();
const {showRequest, parserData, getDate} = require('../utils')
const fs = require('fs');

function getHour(time){
    return parseInt(time.split(':')[0]);
}

function getMinute(time){
    return parseInt(time.split(':')[1]);
}

router.get("/", (req, res) => {
    showRequest(req);

    fs.readFile("notification.json", (err, data) => {
        let notification = err ? {} : parserData(data);
        let reminder = {};

        if (notification)
        {
            let date = getDate();
            let minutes = date.getHours() * 60 + date.getMinutes();
            let startMinutes = getHour(notification.start) * 60 + getMinute(notification.start);
            let endMinutes = getHour(notification.end) * 60 + getMinute(notification.end);
            
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