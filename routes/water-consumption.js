const express = require('express');
const router = express.Router();
const { logRequest, parseDateUTC } = require('../utils');
const Consumption = require('../models/consumption');
const { showTimers } = require('../socket-reminder.js');

router.get("/", logRequest, async (req, res) => {
    try {
        if (!req.query.date) {
            return res.status(400).json({ message: "Parâmetro 'date' é obrigatório (YYYY-MM-DD)" });
        }

        const filterDate = parseDateUTC(req.query.date);

        const filterNextDay = new Date(filterDate);
        filterNextDay.setUTCDate(filterNextDay.getUTCDate() + 1);

        const filter = {
            date: {
                $gte: filterDate,
                $lt: filterNextDay
            }
        };

        const consumptions = await Consumption.find(filter);
        console.log(`Send: ${JSON.stringify(consumptions)}`);

        res.json(consumptions);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", logRequest, async (req, res) => {
    const { type, quantity, time, date } = req.body;

    let localeDateString = new Date().toLocaleDateString();

    showTimers();
    const consumption = new Consumption({
        type: type,
        quantity: quantity,
        time: time,
        date: date ? date : new Date(localeDateString)
    });

    try {
        const newConsumption = await consumption.save();
        console.log(`Send: ${JSON.stringify(newConsumption)}`);
        res.status(200).json(newConsumption);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", logRequest, (req, res) => {
    try {
        Consumption.findByIdAndRemove(req.params.id, (error) => {
            let response;

            if (error) {
                response = { message: error.message };
                console.log(`Send: ${JSON.stringify(response)}`);
                return res.status(500).json(response);
            }

            response = { message: "Item removed" };
            console.log(`Send: ${JSON.stringify(response)}`);
            res.json(response);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports.routerWaterConsumption = router;