const express = require('express');
const router = express.Router();
const CST = require('../models/cstModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache de 24h

// Buscar todos os CSTs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_csts");
        if (cachedData) {
            return res.json(cachedData);
        }

        const csts = await CST.find();
        cache.set("all_csts", csts);
        res.json(csts);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CSTs' });
    }
});

// Buscar CST pelo código
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        let cachedData = cache.get(`cst_${codigo}`);
        if (cachedData) {
            return res.json(cachedData);
        }

        const cstEncontrado = await CST.findOne({ codigo: codigo });

        if (!cstEncontrado) {
            return res.status(404).json({ mensagem: 'CST não encontrado' });
        }

        cache.set(`cst_${codigo}`, cstEncontrado);
        res.json(cstEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CST' });
    }
});

module.exports = router;
