const CFOP = require('../models/cfopModel');

// Criar um novo CFOP
exports.createCFOP = async (req, res) => {
    try {
        const { codigo, descricao, tipo } = req.body;
        const novoCFOP = new CFOP({ codigo, descricao, tipo });
        await novoCFOP.save();
        res.status(201).json(novoCFOP);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todos os CFOPs
exports.getAllCFOPs = async (req, res) => {
    try {
        const cfops = await CFOP.find();
        res.json(cfops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar um CFOP pelo ID
exports.getCFOPById = async (req, res) => {
    try {
        const cfop = await CFOP.findById(req.params.id);
        if (!cfop) {
            return res.status(404).json({ message: 'CFOP não encontrado' });
        }
        res.json(cfop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um CFOP
exports.updateCFOP = async (req, res) => {
    try {
        const cfop = await CFOP.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cfop) {
            return res.status(404).json({ message: 'CFOP não encontrado' });
        }
        res.json(cfop);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deletar um CFOP
exports.deleteCFOP = async (req, res) => {
    try {
        const cfop = await CFOP.findByIdAndDelete(req.params.id);
        if (!cfop) {
            return res.status(404).json({ message: 'CFOP não encontrado' });
        }
        res.json({ message: 'CFOP removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
