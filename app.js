const PORT_DEFAULT = 8000;

// Requires
const fs = require("fs");
const express = require("express");
const cors = require('cors');
const app = express();
var server = require('http').Server(app);
const {routerPerfil} = require("./routes/perfil");
const {routerNotification} = require('./routes/notification');
const {routerWaterConsumption} = require('./routes/water-consumption')
const {routerReminder} = require('./routes/reminder')
const {readConfigurationInterval} = require('./utils');
const {reminderEventConnection} = require('./socket-reminder.js');

// Middleware
app.use(express.json());
app.use(cors());
app.use("/", express.static('client/'));
app.use("/perfil", routerPerfil);
app.use('/notification', routerNotification);
app.use('/water-consumption', routerWaterConsumption);
app.use('/reminder', routerReminder);

// Main
let port = PORT_DEFAULT;

// Call readConfigurationInterval is Sync and wait to conclusion.
let timeInterval = readConfigurationInterval();

// Create socket to real time reminder
const io = require('socket.io')(server);
reminderEventConnection(io, timeInterval);

server.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
})
