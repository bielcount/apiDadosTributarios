const express = require('express');
const router = express.Router();
const CSOSN = require('../models/csosnModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

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

        const csosnEncontrado = await CSOSN.findOne({ codigo });
        if (!csosnEncontrado) {
            return res.status(404).json({ mensagem: 'CSOSN não encontrado' });
        }

        cache.set(`csosn_${codigo}`, csosnEncontrado);
        res.json(csosnEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CSOSN' });
    }
});

// Criar novo CSOSN
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        if (!codigo || !descricao) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const csosnExistente = await CSOSN.findOne({ codigo });
        if (csosnExistente) {
            return res.status(400).json({ erro: 'CSOSN já existe' });
        }

        const novoCSOSN = new CSOSN({ codigo, descricao });
        await novoCSOSN.save();

        cache.del("all_csosns");
        res.status(201).json(novoCSOSN);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CSOSN' });
    }
});

// Criar múltiplos CSOSNs
router.post('/bulk', async (req, res) => {
    try {
        const csosns = req.body;
        if (!Array.isArray(csosns) || csosns.length === 0) {
            return res.status(400).json({ erro: 'Envie um array de CSOSNs' });
        }

        const codigos = csosns.map(c => c.codigo);
        const csosnsExistentes = await CSOSN.find({ codigo: { $in: codigos } });

        // Filtra apenas os CSOSNs que não existem no banco
        const novosCSOSNs = csosns.filter(c => !csosnsExistentes.some(e => e.codigo === c.codigo));
        const quantidadeExistentes = csosnsExistentes.length;
        const quantidadeInseridos = novosCSOSNs.length;

        if (quantidadeInseridos > 0) {
            await CSOSN.insertMany(novosCSOSNs);
            cache.del("all_csosns");
        }

        res.status(201).json({
            mensagem: quantidadeInseridos > 0 
                ? `${quantidadeInseridos} novos CSOSNs inseridos com sucesso` 
                : "Nenhum novo CSOSN foi inserido",
            aviso: quantidadeExistentes > 0 
                ? `${quantidadeExistentes} CSOSNs já existiam no banco e não foram inseridos` 
                : undefined
        });

    } catch (error) {
        res.status(500).json({ erro: 'Erro ao inserir múltiplos CSOSNs' });
    }
});

// Atualizar CSOSN
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao } = req.body;

        const csosnAtualizado = await CSOSN.findOneAndUpdate({ codigo }, { descricao }, { new: true });
        if (!csosnAtualizado) {
            return res.status(404).json({ erro: 'CSOSN não encontrado' });
        }

        cache.del(["all_csosns", `csosn_${codigo}`]);
        res.json(csosnAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CSOSN' });
    }
});

// Excluir CSOSN
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const csosnExcluido = await CSOSN.findOneAndDelete({ codigo });

        if (!csosnExcluido) {
            return res.status(404).json({ erro: 'CSOSN não encontrado' });
        }

        cache.del(["all_csosns", `csosn_${codigo}`]);
        res.json({ mensagem: 'CSOSN excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir CSOSN' });
    }
});

module.exports = router;
