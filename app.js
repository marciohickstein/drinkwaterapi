const PORT_DEFAULT = 8000;

// Requires
const {readFile} = require("fs");
const express = require("express");
//const cors = require('cors');
const app = express();
var server = require('http').Server(app);
const {routerPerfil} = require("./routes/perfil");
const {routerNotification} = require('./routes/notification');
const {routerWaterConsumption} = require('./routes/water-consumption')
const {routerReminder} = require('./routes/reminder')
const {readConfigurationInterval} = require('./utils');
const {reminderConnection} = require('./socket-reminder.js');

// Middleware
app.use(express.json());
//app.use(cors());
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
reminderConnection(io, timeInterval);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    readFile("./client/error404.html", (err, data) => {
        if (err)
            res.status(404).send('Erro 404<br>Página NÃO econtrada');
        else
            res.status(404).send(data.toString());
    })
});

server.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
})
