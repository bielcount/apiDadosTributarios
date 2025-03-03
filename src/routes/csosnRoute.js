const express = require('express');
const router = express.Router();
const CSOSN = require('../models/csosnModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache de 24h

// Buscar todos os CSOSNs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_csosns");
        if (cachedData) {
            return res.json(cachedData);
        }

        const csosns = await CSOSN.find();
        cache.set("all_csosns", csosns);
        res.json(csosns);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CSOSNs' });
    }
});

// Buscar CSOSN pelo código
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        let cachedData = cache.get(`csosn_${codigo}`);
        if (cachedData) {
            return res.json(cachedData);
        }

        const csosnEncontrado = await CSOSN.findOne({ codigo: codigo });

        if (!csosnEncontrado) {
            return res.status(404).json({ mensagem: 'CSOSN não encontrado' });
        }

        cache.set(`csosn_${codigo}`, csosnEncontrado);
        res.json(csosnEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CSOSN' });
    }
});

module.exports = router;
