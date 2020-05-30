const express = require('express');
const router = express.Router();
const {showRequest, response, parserData} = require('../utils')
const fs = require('fs');

function getFileName(){
    let strDateAndTime = new Date().toISOString();
    let dateAndTime = strDateAndTime.split('T');

    return `water-consumption-${dateAndTime[0]}.json`;
}

router.get("/", (req, res) => {
    showRequest(req);

    let filename = getFileName();
    fs.readFile(filename, (err, data) => {
        let consumption = err ? {} : parserData(data);

        if (consumption == null)
            consumption = {};
        console.log(`Send: ${JSON.stringify(consumption)}`);
        res.json(consumption);
    })

})

router.post("/", (req,res) => {
    showRequest(req, req.body);

    let filename = getFileName();
    
    fs.readFile(filename, (err, dataFile) => {
        let dataObject = { date: [] };

        if (!err)
            dataObject = parserData(dataFile.toString());

        dataObject.date.push(req.body);
        let dataToWrite = JSON.stringify(dataObject);
        fs.writeFile(filename, dataToWrite, (err) => {
            let ret;

            if (err)
                ret = response(1, "Nao foi possivel salvar os dados na base");
            else 
                ret = response(0, "Dados foram salvos com sucesso");
    
            console.log(`Send: ${JSON.stringify(ret)}`);
            res.json(ret);
        })
    })
})

router.delete("/:id", (req,res) => {
    showRequest(req);

    let filename = getFileName();
    
    fs.readFile(filename, (err, dataFile) => {
        let dataObject = { date: [] };

        if (!err)
            dataObject = parserData(dataFile.toString());

        let position = req.params.id;

        let removed = {};

        if (position > 0 && position <= dataObject.date.length)
        {
            removed = dataObject.date.splice(position-1, 1);
            let dataToWrite = JSON.stringify(dataObject);

            fs.writeFile(filename, dataToWrite, (err) => {
                if (err)
                    removed = response(1, "Nao foi possivel salvar os dados na base");
            })
        }
        console.log(`Send: ${JSON.stringify(removed)}`);
        res.json(removed);
    })
})


module.exports.routerWaterConsumption = router;