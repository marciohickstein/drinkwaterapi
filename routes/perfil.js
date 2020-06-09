const {readFile, writeFile} = require('fs');
const express = require('express');
const router = express.Router();
const {response} = require('../utils')
const {logRequest} = require('../utils')

// Rotas para retornar e salvar os dados do perfil
router.get("/", logRequest, (req, res) => {
    readFile("perfil.json", (err, data) => {
        let perfil = err ? {} : JSON.parse(data);
        console.log(`Send: ${JSON.stringify(perfil)}`);
        res.json(perfil);
    })

})

router.post("/", logRequest, (req, res) => {
    const data = JSON.stringify(req.body);
    const {email, passwd, weight} = req.body;

    if (!email || !passwd || !weight)
    {
        res.json(response(1, "Dados enviados no formato invalido"));
        return ;
    }

    writeFile("perfil.json", data, (err) => {
        let ret;
        if (err)
            ret = response(1, "Nao foi possivel salvar os dados na base");
        else 
            ret = response(0, "Dados foram salvos com sucesso");

        console.log(`Send: ${JSON.stringify(ret)}`);
        res.json(ret);
    })
})

module.exports.routerPerfil = router;