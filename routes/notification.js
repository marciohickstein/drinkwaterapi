const {readFile, writeFile} = require('fs');
const express = require('express');
const router = express.Router();
const {response} = require('../utils')
const {logRequest} = require('../utils')

// Rotas para retornar e salvar os dados de notificacao
router.get("/", logRequest, (req, res) => {
    readFile("notification.json", (err, data) => {
        let notification = err ? {} : JSON.parse(data);
        console.log(`Send: ${JSON.stringify(notification)}`);
        res.json(notification);
    })
})

router.post("/", logRequest, (req, res) => {
    let notificationValidation = req.body;

    if (notificationValidation.start.length <= 0 || notificationValidation.end.length <= 0 || notificationValidation.interval.length <= 0)
        return response(1, "Dados enviados no formato invalido");
    
    const data = JSON.stringify(notificationValidation);

    writeFile("notification.json", data, (err) => {
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