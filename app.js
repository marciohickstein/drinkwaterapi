const fs = require("fs");
const express = require("express");
const cors = require('cors');
const app = express();
const {routerPerfil} = require("./routes/perfil");
const {routerNotification} = require('./routes/notification');
const {routerWaterConsumption} = require('./routes/water-consumption')
const {routerReminder} = require('./routes/reminder')
const {response} = require('./utils')

app.use(express.json());
app.use(cors());
app.use("/perfil", routerPerfil);
app.use('/notification', routerNotification);
app.use('/water-consumption', routerWaterConsumption);
app.use('/reminder', routerReminder);
let port = 8000;

app.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
})
