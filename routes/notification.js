const fs = require('fs');
const express = require('express');
const cors = require('cors');
const router = express.Router();
const {response} = require('../utils')
const {showRequest} = require('../utils')

router.options('/', cors());

// Rotas para retornar e salvar os dados de notificacao
router.get("/", cors(), (req, res) => {
    showRequest(req);
    fs.readFile("notification.json", (err, data) => {
        let notification = err ? {} : JSON.parse(data);
        console.log(`Send: ${JSON.stringify(notification)}`);
        res.json(notification);
    })
})

router.post("/", cors(), (req, res) => {
    const data = JSON.stringify(req.body);

    showRequest(req, data);

    let notificationValidation = req.body;

    if (notificationValidation.start.length <= 0 || notificationValidation.end.length <= 0 || notificationValidation.interval.length <= 0)
        return response(1, "Dados enviados no formato invalido");
    
    fs.writeFile("notification.json", data, (err) => {
        let cod = 0, msg = "Dados foram salvos com sucesso";

        if (err){
            cod = 1;
            msg = "Nao foi possivel salvar os dados na base";
        }

       const ret = response(cod, msg);
       console.log(`Send: ${JSON.stringify(ret)}`);
       res.json(ret);
    })
})

module.exports.routerNotification = router;