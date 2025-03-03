const express = require('express');
const router = express.Router();
const CSOSN = require('../models/csosnModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache expira em 24h

// Buscar todos os CSOSNs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_csosn");
        if (cachedData) {
            return res.json(cachedData);
        }

        const csosns = await CSOSN.find();
        cache.set("all_csosn", csosns); // Armazena no cache
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

        const csosnEncontrado = await CSOSN.findOne({ codigo });

        if (!csosnEncontrado) {
            return res.status(404).json({ mensagem: 'CSOSN não encontrado' });
        }

        cache.set(`csosn_${codigo}`, csosnEncontrado); // Armazena no cache
        res.json(csosnEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CSOSN' });
    }
});

// Criar um novo CSOSN (POST)
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        
        // Verifica se já existe um CSOSN com esse código
        const csosnExistente = await CSOSN.findOne({ codigo });
        if (csosnExistente) {
            return res.status(400).json({ erro: 'CSOSN já cadastrado' });
        }

        const novoCSOSN = new CSOSN({ codigo, descricao });
        await novoCSOSN.save();

        cache.del("all_csosn"); // Limpa o cache da lista para garantir atualização
        
        res.status(201).json(novoCSOSN);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CSOSN' });
    }
});

// Atualizar um CSOSN pelo código (PUT)
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao } = req.body;

        const csosnAtualizado = await CSOSN.findOneAndUpdate(
            { codigo },
            { descricao },
            { new: true } // Retorna o documento atualizado
        );

        if (!csosnAtualizado) {
            return res.status(404).json({ mensagem: 'CSOSN não encontrado' });
        }

        cache.del(`csosn_${codigo}`); // Remove o cache desse CSOSN específico
        cache.del("all_csosn"); // Remove o cache da lista

        res.json(csosnAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CSOSN' });
    }
});

// Deletar um CSOSN pelo código (DELETE)
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const csosnDeletado = await CSOSN.findOneAndDelete({ codigo });

        if (!csosnDeletado) {
            return res.status(404).json({ mensagem: 'CSOSN não encontrado' });
        }

        cache.del(`csosn_${codigo}`); // Remove do cache
        cache.del("all_csosn"); // Remove o cache da lista

        res.json({ mensagem: 'CSOSN deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar CSOSN' });
    }
});

module.exports = router;
