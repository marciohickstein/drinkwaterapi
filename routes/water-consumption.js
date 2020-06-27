const express = require('express');
const router = express.Router();
const {logRequest, response, parserData, getDate} = require('../utils');
const Consumption = require('../models/consumption');
const consumption = require('../models/consumption');
const {showTimers} = require('../socket-reminder.js')

router.get("/", logRequest, async (req, res) => {
    try {
        let localeDateString = new Date().toLocaleDateString();
        let localeDate = new Date(localeDateString);

        let filterDate = localeDate.toISOString().split('T')[0];
        let filterDateStart = filterDate+'T00:00:00'
        let filterDateEnd = filterDate+'T23:59:59'

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

    showTimers();
    const consumption = new Consumption({
        type: type,
        quantity: quantity,
        time: time,
        date: new Date(localeDateString)
    })

    try {
        const newConsumption = await consumption.save();
        console.log(`Send: ${JSON.stringify(newConsumption)}`);
        res.status(200).json(newConsumption);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

router.delete("/:id", logRequest, (req,res) => {
    try {
        Consumption.findByIdAndRemove(req.params.id, (error) => {
            let response;

            if (error){
                response = {message: error.message};
                console.log(`Send: ${JSON.stringify(response)}`);
                return res.status(500).json(response);
            }
            
            response = {message: "Item removed"};
            console.log(`Send: ${JSON.stringify(response)}`);
            res.json(response);
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

module.exports.routerWaterConsumption = router;