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
const {routerAuth} = require('./routes/auth');
const {protect} = require('./middleware/auth');
const {readConfigurationInterval} = require('./utils');
const {reminderConnection} = require('./socket-reminder.js');

// Middleware
app.use(express.json());
//app.use(cors());

// Secure - Configure Helmet with CSP that allows self scripts
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    }
}));
// Data Sanitization against XSS attacks
app.use(xss());
// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit is 10

// const limit = rateLimit({
//     max: 100,// max requests
//     windowMs: 60 * 60 * 1000, // 1 Hour
//     message: 'Too many requests' // message to send
// });
// //  apply to all requests
// app.use(limit);

// Routes
// Public routes
app.use("/", express.static('client/'));
app.use("/auth", routerAuth);

// Protected routes
app.use("/perfil", protect, routerPerfil);
app.use('/notification', protect, routerNotification);
app.use('/water-consumption', protect, routerWaterConsumption);
app.use('/reminder', protect, routerReminder);

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

console.log(`Running in ${process.env.NODE_ENV === 'development' ? process.env.NODE_ENV : 'production'}`);

const databaseString = process.env.NODE_ENV === 'development' ? process.env.DATABASE_STRING_DEBUG : process.env.DATABASE_STRING;

mongoose.connect(databaseString, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', (err) => {
    console.log(`Error to connect database: ${err}`);
});

// Seed default admin user on database connect
db.on('open', async () => {
    console.log("Database connected!");

    // Seed admin if not exists
    const Perfil = require('./models/perfil');
    try {
        const adminExists = await Perfil.findOne({ email: 'admin' });
        if (!adminExists) {
            // Find next available ID
            const lastUser = await Perfil.findOne().sort({ id: -1 });
            const nextId = lastUser ? lastUser.id + 1 : 1;

            await Perfil.create({
                id: nextId,
                email: 'admin',
                passwd: 'admin#2026',
                weight: 70,
                role: 'admin'
            });
            console.log('Default admin user created (admin / admin#2026)');
        }
    } catch (err) {
        console.log('Error seeding admin user:', err.message);
    }
});

const port = process.env.NODE_ENV === 'development' ? process.env.PORT_DEFAULT_DEBUG : process.env.PORT_DEFAULT;

server.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
});
