const fs = require("fs");
const express = require("express");
const cors = require('cors');
const app = express();
const {routerPerfil} = require("./routes/perfil");
const {routerNotification} = require('./routes/notification');
const {response} = require('./utils')

app.use(express.json());
app.options('/perfil', cors());
app.use("/perfil", routerPerfil);
app.use('/notification', routerNotification);

let port = 8000;

app.listen(port, () => {
    console.log(`Server Drink Water API running on ${port}`);
})
