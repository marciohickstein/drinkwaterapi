const express = require('express');
const router = express.Router();
const {response} = require('../utils')
const {logRequest} = require('../utils')
const Perfil = require('../models/perfil');

// Rotas para retornar e salvar os dados do perfil

// GET all items
router.get("/", logRequest, async (req, res) => {
    try{
        const perfil = await Perfil.find();
        console.log(`Send: ${JSON.stringify(perfil)}`);
        res.json(perfil);
    }catch(error){
        res.status(500).json({message: error.message});
    }
})

// INSERT item
router.post("/", logRequest, async (req, res) => {
    const {id, email, passwd, weight} = req.body;

    const perfil = new Perfil({
        id: id,
        email: email,
        passwd: passwd,
        weight: weight
    })

    try {
        const newPerfil = await perfil.save();
        res.status(201).json(newPerfil);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

// GET item by ID
router.get("/:id", logRequest, getPerfil, async (req, res) => {
        console.log(`Send: ${JSON.stringify(res.perfil)}`);
        res.json(res.perfil);
})

// UPDATE item by ID
router.patch("/:id", logRequest, getPerfil, async (req, res) => {
    try {
        const {email, passwd, weight} = req.body;

        if (email){
            res.perfil.email = email;        
        }

        if (passwd){
            res.perfil.passwd = passwd;        
        }

        if (weight){
            res.perfil.weight = weight;        
        }

        const updatePerfil = await res.perfil.save();
        res.status(201).json(updatePerfil);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

// Middleware to get perfil by ID
async function getPerfil(req, res, next) {
    try {
        perfil = await Perfil.findOne({id: +req.params.id});
        if (perfil == null)
            return res.status(404).json({message: `Perfil ${id} não encontrado`});
    } catch (error) {
        return res.status(400).json({message: error.message});
    }

    res.perfil = perfil;

    next();
}

module.exports.routerPerfil = router;
