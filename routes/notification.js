const express = require('express');
const router = express.Router();
const {response, logRequest} = require('../utils')
const Notification = require('../models/notification');
const notification = require('../models/notification');

// Rotas para retornar e salvar os dados de notificacao
router.get("/", logRequest, async (req, res) => {
    try {
        notification = await Notification.find();
        res.json(notification);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// INSERT item : THIS FUNCTION IS NOT USED!!!
router.post("/", logRequest, async (req, res) => {
let id = +req.params.id;

    const notification = new Notification({
        id: req.body.id,
        start: req.body.start,
        end: req.body.end,
        interval: req.body.interval,
    })
    console.log(notification)
    try {
        const newNotification = await notification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

// GET item by id
router.get("/:id", logRequest, getNotification, async (req, res) => {
    console.log(`Send: ${JSON.stringify(res.notif)}`);
    res.json(res.notif);
})

// UPDATE item by ID
router.patch("/:id", logRequest, getNotification, async (req, res) => {
    try {
        const {start, end, interval} = req.body;

        if (start)
            res.notif.start = start;        

        if (end)
            res.notif.end = end;        

        if (interval)
            res.notif.interval = interval;        

        const updateNofication = await res.notif.save();
        res.status(201).json(updateNofication);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

async function getNotification(req, res, next) {
    try {
        notif = await Notification.findOne({id: +req.params.id});
        if (notif == null)
            return res.status(400).json({message: "Notificação não encontrada"});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }

    res.notif = notif;
    next();
}



module.exports.routerNotification = router;