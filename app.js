// Requires
require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
//const cors = require('cors');
const app = express();
var server = require('http').Server(app);
const {routerPerfil} = require("./routes/perfil");
const {routerNotification} = require('./routes/notification');
const {routerWaterConsumption} = require('./routes/water-consumption');
const {routerReminder} = require('./routes/reminder');
const {readConfigurationInterval} = require('./utils');
const {reminderConnection} = require('./socket-reminder.js');

// Middleware
app.use(express.json());
//app.use(cors());

// Secure
app.use(helmet());
// Data Sanitization against XSS attacks
app.use(xss());
// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit is 10

const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests' // message to send
});
//  apply to all requests
app.use(limit);

// Routes
app.use("/", express.static('client/'));
app.use("/perfil", routerPerfil, );
app.use('/notification', routerNotification);
app.use('/water-consumption', routerWaterConsumption);
app.use('/reminder', routerReminder);

// Main

// Call readConfigurationInterval is Sync and wait to conclusion.
let timeInterval = readConfigurationInterval();

// Create socket to real time reminder
const io = require('socket.io')(server);
reminderConnection(io, timeInterval);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.sendFile(__dirname+'/client/error404.html');
});

mongoose.connect(process.env.DATABASE_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', (err) => { 
    console.log(`Error to connect database: ${err}`);
});
db.on('open', () => console.log("Database connected!"));

let port = process.env.PORT_DEFAULT;

server.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
});
