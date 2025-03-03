const express = require('express');
const router = express.Router();
const CST = require('../models/cstModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache expira em 24h

// Buscar todos os CSTs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_cst");
        if (cachedData) {
            return res.json(cachedData);
        }

        const csts = await CST.find();
        cache.set("all_cst", csts); // Armazena no cache
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

        const cstEncontrado = await CST.findOne({ codigo });

        if (!cstEncontrado) {
            return res.status(404).json({ mensagem: 'CST não encontrado' });
        }

        cache.set(`cst_${codigo}`, cstEncontrado); // Armazena no cache
        res.json(cstEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CST' });
    }
});

// Criar um novo CST (POST)
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        
        // Verifica se já existe um CST com esse código
        const cstExistente = await CST.findOne({ codigo });
        if (cstExistente) {
            return res.status(400).json({ erro: 'CST já cadastrado' });
        }

        const novoCST = new CST({ codigo, descricao });
        await novoCST.save();

        cache.del("all_cst"); // Limpa o cache da lista para garantir atualização
        
        res.status(201).json(novoCST);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CST' });
    }
});

// Atualizar um CST pelo código (PUT)
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao } = req.body;

        const cstAtualizado = await CST.findOneAndUpdate(
            { codigo },
            { descricao },
            { new: true } // Retorna o documento atualizado
        );

        if (!cstAtualizado) {
            return res.status(404).json({ mensagem: 'CST não encontrado' });
        }

        cache.del(`cst_${codigo}`); // Remove o cache desse CST específico
        cache.del("all_cst"); // Remove o cache da lista

        res.json(cstAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CST' });
    }
});

// Deletar um CST pelo código (DELETE)
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const cstDeletado = await CST.findOneAndDelete({ codigo });

        if (!cstDeletado) {
            return res.status(404).json({ mensagem: 'CST não encontrado' });
        }

        cache.del(`cst_${codigo}`); // Remove do cache
        cache.del("all_cst"); // Remove o cache da lista

        res.json({ mensagem: 'CST deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar CST' });
    }
});

module.exports = router;
