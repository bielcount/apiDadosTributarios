const express = require('express');
const router = express.Router();
const CFOP = require('../models/cfopModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Buscar todos os CFOPs
router.get('/', async (req, res) => {
    try {
        let cachedData = cache.get("all_cfops");
        if (cachedData) {
            return res.json(cachedData);
        }

        const cfops = await CFOP.find();
        cache.set("all_cfops", cfops);
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

        const cfopEncontrado = await CFOP.findOne({ codigo });
        if (!cfopEncontrado) {
            return res.status(404).json({ mensagem: 'CFOP não encontrado' });
        }

        cache.set(`cfop_${codigo}`, cfopEncontrado);
        res.json(cfopEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CFOP' });
    }
});

// Criar novo CFOP
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao, tipo } = req.body;
        if (!codigo || !descricao || !tipo) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const cfopExistente = await CFOP.findOne({ codigo });
        if (cfopExistente) {
            return res.status(400).json({ erro: 'CFOP já existe' });
        }

        const novoCFOP = new CFOP({ codigo, descricao, tipo });
        await novoCFOP.save();

        cache.del("all_cfops");
        res.status(201).json(novoCFOP);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CFOP' });
    }
});

// Criar múltiplos CFOPs
router.post('/bulk', async (req, res) => {
    try {
        const cfops = req.body;
        if (!Array.isArray(cfops) || cfops.length === 0) {
            return res.status(400).json({ erro: 'Envie um array de CFOPs' });
        }

        const codigos = cfops.map(c => c.codigo);
        const cfopsExistentes = await CFOP.find({ codigo: { $in: codigos } });

        // Filtra apenas os CFOPs que não existem no banco
        const novosCFOPs = cfops.filter(c => !cfopsExistentes.some(e => e.codigo === c.codigo));
        const quantidadeExistentes = cfopsExistentes.length;
        const quantidadeInseridos = novosCFOPs.length;

        if (quantidadeInseridos > 0) {
            await CFOP.insertMany(novosCFOPs);
            cache.del("all_cfops");
        }

        res.status(201).json({
            mensagem: quantidadeInseridos > 0 
                ? `${quantidadeInseridos} novos CFOPs inseridos com sucesso` 
                : "Nenhum novo CFOP foi inserido",
            aviso: quantidadeExistentes > 0 
                ? `${quantidadeExistentes} CFOPs já existiam no banco e não foram inseridos` 
                : undefined
        });

    } catch (error) {
        res.status(500).json({ erro: 'Erro ao inserir múltiplos CFOPs' });
    }
});


// Atualizar CFOP
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao, tipo } = req.body;

        const cfopAtualizado = await CFOP.findOneAndUpdate({ codigo }, { descricao, tipo }, { new: true });
        if (!cfopAtualizado) {
            return res.status(404).json({ erro: 'CFOP não encontrado' });
        }

        cache.del(["all_cfops", `cfop_${codigo}`]);
        res.json(cfopAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CFOP' });
    }
});

// Excluir CFOP
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const cfopExcluido = await CFOP.findOneAndDelete({ codigo });

        if (!cfopExcluido) {
            return res.status(404).json({ erro: 'CFOP não encontrado' });
        }

        cache.del(["all_cfops", `cfop_${codigo}`]);
        res.json({ mensagem: 'CFOP excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir CFOP' });
    }
});

module.exports = router;
