const express = require('express');
const router = express.Router();
const CFOP = require('../models/cfopModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache expira em 24h

// Buscar todos os CFOPs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_cfops");
        if (cachedData) {
            return res.json(cachedData);
        }

        const cfops = await CFOP.find();
        cache.set("all_cfops", cfops); // Armazena no cache
        res.json(cfops);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CFOPs' });
    }
});

// Buscar CFOP pelo código
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        let cachedData = cache.get(`cfop_${codigo}`);
        if (cachedData) {
            return res.json(cachedData);
        }

        const cfopEncontrado = await CFOP.findOne({ codigo: codigo });

        if (!cfopEncontrado) {
            return res.status(404).json({ mensagem: 'CFOP não encontrado' });
        }

        cache.set(`cfop_${codigo}`, cfopEncontrado); // Armazena no cache
        res.json(cfopEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CFOP' });
    }
});

module.exports = router;
