const express = require('express');
const router = express.Router();
const CST = require('../models/cstModel');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

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

        const cstEncontrado = await CST.findOne({ codigo });
        if (!cstEncontrado) {
            return res.status(404).json({ mensagem: 'CST não encontrado' });
        }

        cache.set(`cst_${codigo}`, cstEncontrado);
        res.json(cstEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar CST' });
    }
});

// Criar novo CST
router.post('/', async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        if (!codigo || !descricao) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const cstExistente = await CST.findOne({ codigo });
        if (cstExistente) {
            return res.status(400).json({ erro: 'CST já existe' });
        }

        const novoCST = new CST({ codigo, descricao });
        await novoCST.save();

        cache.del("all_csts");
        res.status(201).json(novoCST);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar CST' });
    }
});

// Criar múltiplos CSTs
router.post('/bulk', async (req, res) => {
    try {
        const csts = req.body;
        if (!Array.isArray(csts) || csts.length === 0) {
            return res.status(400).json({ erro: 'Envie um array de CSTs' });
        }

        const codigos = csts.map(c => c.codigo);
        const cstsExistentes = await CST.find({ codigo: { $in: codigos } });

        // Filtra apenas os CSTs que não existem no banco
        const novosCSTs = csts.filter(c => !cstsExistentes.some(e => e.codigo === c.codigo));
        const quantidadeExistentes = cstsExistentes.length;
        const quantidadeInseridos = novosCSTs.length;

        if (quantidadeInseridos > 0) {
            await CST.insertMany(novosCSTs);
            cache.del("all_csts");
        }

        res.status(201).json({
            mensagem: quantidadeInseridos > 0 
                ? `${quantidadeInseridos} novos CSTs inseridos com sucesso` 
                : "Nenhum novo CST foi inserido",
            aviso: quantidadeExistentes > 0 
                ? `${quantidadeExistentes} CSTs já existiam no banco e não foram inseridos` 
                : undefined
        });

    } catch (error) {
        res.status(500).json({ erro: 'Erro ao inserir múltiplos CSTs' });
    }
});

// Atualizar CST
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao } = req.body;

        const cstAtualizado = await CST.findOneAndUpdate({ codigo }, { descricao }, { new: true });
        if (!cstAtualizado) {
            return res.status(404).json({ erro: 'CST não encontrado' });
        }

        cache.del(["all_csts", `cst_${codigo}`]);
        res.json(cstAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar CST' });
    }
});

// Excluir CST
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const cstExcluido = await CST.findOneAndDelete({ codigo });

        if (!cstExcluido) {
            return res.status(404).json({ erro: 'CST não encontrado' });
        }

        cache.del(["all_csts", `cst_${codigo}`]);
        res.json({ mensagem: 'CST excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir CST' });
    }
});

module.exports = router;
