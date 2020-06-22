const express = require('express');
const router = express.Router();
const {logRequest, response, parserData, getDate} = require('../utils');
const Consumption = require('../models/consumption');
const consumption = require('../models/consumption');

router.get("/", logRequest, async (req, res) => {
    try {
        let localeDateString = new Date().toLocaleDateString();
        let localeDate = new Date(localeDateString);

        console.log(localeDate.toISOString());
        let filterDate = localeDate.toISOString().split('T')[0];
        // let filterDateStart = '2020-06-21T00:00:00'
        // let filterDateEnd = '2020-06-21T23:59:59'
        let filterDateStart = filterDate+'T00:00:00'
        let filterDateEnd = filterDate+'T23:59:59'

        console.log(`{ date: { $gte: ${filterDateStart}, $lte: ${filterDateEnd } }`)
        consumptions = await Consumption.find({ date: { $gte: filterDateStart, $lte: filterDateEnd } });

    } catch (error) {
        res.status(500).json({message: error.message});
    }
    console.log(`Send: ${JSON.stringify(consumptions)}`);
    res.json(consumptions);
})

router.post("/", logRequest, async (req,res) => {
    const {type, quantity, time} = req.body;

    let localeDateString = new Date().toLocaleDateString();    


    const consumption = new Consumption({
        type: type,
        quantity: quantity,
        time: time,
        date: new Date(localeDateString)
    })

    try {
        const newConsumption = await consumption.save();
        res.status(200).json(newConsumption);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

router.delete("/:id", logRequest, (req,res) => {
    try {
console.log(req.params.id);
        Consumption.findByIdAndRemove(req.params.id, (error) => {
            if (error)
                return  res.status(500).json({message: error.message});

            res.json({message: "Item removed"});
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

module.exports.routerWaterConsumption = router;