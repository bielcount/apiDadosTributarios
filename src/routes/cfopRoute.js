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

// Criar um novo CFOP (POST)
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao, tipo } = req.body;
        
        // Verifica se já existe um CFOP com esse código
        const cfopExistente = await CFOP.findOne({ codigo });
        if (cfopExistente) {
            return res.status(400).json({ erro: 'CFOP já cadastrado' });
        }

        const novoCFOP = new CFOP({ codigo, descricao, tipo });
        await novoCFOP.save();

        cache.del("all_cfops"); // Limpa o cache da lista para garantir atualização
        
        res.status(201).json(novoCFOP);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CFOP' });
    }
});

// Atualizar um CFOP pelo código (PUT)
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao, tipo } = req.body;

        const cfopAtualizado = await CFOP.findOneAndUpdate(
            { codigo },
            { descricao, tipo },
            { new: true } // Retorna o documento atualizado
        );

        if (!cfopAtualizado) {
            return res.status(404).json({ mensagem: 'CFOP não encontrado' });
        }

        cache.del(`cfop_${codigo}`); // Remove o cache desse CFOP específico
        cache.del("all_cfops"); // Remove o cache da lista

        res.json(cfopAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CFOP' });
    }
});

// Deletar um CFOP pelo código (DELETE)
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const cfopDeletado = await CFOP.findOneAndDelete({ codigo });

        if (!cfopDeletado) {
            return res.status(404).json({ mensagem: 'CFOP não encontrado' });
        }

        cache.del(`cfop_${codigo}`); // Remove do cache
        cache.del("all_cfops"); // Remove o cache da lista

        res.json({ mensagem: 'CFOP deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar CFOP' });
    }
});

module.exports = router;
