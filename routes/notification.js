const {readFile, writeFile} = require('fs');
const express = require('express');
const router = express.Router();
const {response} = require('../utils')
const {showRequest} = require('../utils')

// Rotas para retornar e salvar os dados de notificacao
router.get("/", (req, res) => {
    showRequest(req);
    readFile("notification.json", (err, data) => {
        let notification = err ? {} : JSON.parse(data);
        console.log(`Send: ${JSON.stringify(notification)}`);
        res.json(notification);
    })
})

router.post("/", (req, res) => {
    const data = JSON.stringify(req.body);

    showRequest(req, data);

    let notificationValidation = req.body;

    if (notificationValidation.start.length <= 0 || notificationValidation.end.length <= 0 || notificationValidation.interval.length <= 0)
        return response(1, "Dados enviados no formato invalido");
    
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