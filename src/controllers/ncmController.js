const NCM = require('../models/ncmModel');

// Criar um novo NCM
exports.createNCM = async (req, res) => {
    try {
        const { codigo, descricao, data_inicio, data_fim, tipo_ato_ini, numero_ato_ini, ano_ato_ini } = req.body;
        const novoNCM = new NCM({ codigo, descricao, data_inicio, data_fim, tipo_ato_ini, numero_ato_ini, ano_ato_ini });
        await novoNCM.save();
        res.status(201).json(novoNCM);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todos os NCMs
exports.getAllNCMs = async (req, res) => {
    try {
        const ncms = await NCM.find();
        res.json(ncms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar um NCM pelo código
exports.getNCMByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const ncm = await NCM.findOne({ codigo });
        if (!ncm) {
            return res.status(404).json({ message: 'NCM não encontrado' });
        }
        res.json(ncm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um NCM
exports.updateNCM = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descricao, data_inicio, data_fim, tipo_ato_ini, numero_ato_ini, ano_ato_ini } = req.body;

        const ncmAtualizado = await NCM.findOneAndUpdate({ codigo }, { descricao, data_inicio, data_fim, tipo_ato_ini, numero_ato_ini, ano_ato_ini }, { new: true });
        if (!ncmAtualizado) {
            return res.status(404).json({ message: 'NCM não encontrado' });
        }
        res.json(ncmAtualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deletar um NCM
exports.deleteNCM = async (req, res) => {
    try {
        const { codigo } = req.params;
        const ncmDeletado = await NCM.findOneAndDelete({ codigo });
        if (!ncmDeletado) {
            return res.status(404).json({ message: 'NCM não encontrado' });
        }
        res.json({ message: 'NCM removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
