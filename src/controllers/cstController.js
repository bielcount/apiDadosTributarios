const CST = require('../models/cstModel');

// Criar um novo CST
exports.createCST = async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        const novoCST = new CST({ codigo, descricao });
        await novoCST.save();
        res.status(201).json(novoCST);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todos os CSTs
exports.getAllCSTs = async (req, res) => {
    try {
        const csts = await CST.find();
        res.json(csts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar um CST pelo ID
exports.getCSTById = async (req, res) => {
    try {
        const cst = await CST.findById(req.params.id);
        if (!cst) {
            return res.status(404).json({ message: 'CST não encontrado' });
        }
        res.json(cst);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um CST
exports.updateCST = async (req, res) => {
    try {
        const cst = await CST.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cst) {
            return res.status(404).json({ message: 'CST não encontrado' });
        }
        res.json(cst);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deletar um CST
exports.deleteCST = async (req, res) => {
    try {
        const cst = await CST.findByIdAndDelete(req.params.id);
        if (!cst) {
            return res.status(404).json({ message: 'CST não encontrado' });
        }
        res.json({ message: 'CST removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
