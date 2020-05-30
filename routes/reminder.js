const express = require('express');
const router = express.Router();
const {showRequest, parserData} = require('../utils')
const fs = require('fs');

function getFileName(){
    let strDateAndTime = new Date().toISOString();
    let dateAndTime = strDateAndTime.split('T');

    return `reminder-${dateAndTime[0]}.json`;
}

router.get("/", (req, res) => {
    showRequest(req);

    fs.readFile("notification.json", (err, data) => {
        let notification = err ? {} : parserData(data);
        let reminder = {};

        if (notification)
        {
            let date = new Date();
            let minutes = date.getHours() * 60 + date.getMinutes();
            let startMinutes = parseInt(notification.start.split(':')[0]) * 60 + parseInt(notification.start.split(':')[1]);
            let endMinutes = parseInt(notification.end.split(':')[0]) * 60 + parseInt(notification.end.split(':')[1]);
            
            reminder.interval = notification.interval;
            if (minutes >= startMinutes && minutes <= endMinutes)
                reminder.message = "Lembrete: Não esqueça de beber a sua água!";
            else{
                console.log("Nada para lembrar!");
            }
        }
        console.log(`Send: ${JSON.stringify(reminder)}`);
        res.json(reminder);
    });
});

module.exports.routerReminder = router;