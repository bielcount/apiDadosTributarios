const CSOSN = require('../models/csosnModel');

// Criar um novo CSOSN
exports.createCSOSN = async (req, res) => {
    try {
        const { codigo, descricao } = req.body;
        const novoCSOSN = new CSOSN({ codigo, descricao });
        await novoCSOSN.save();
        res.status(201).json(novoCSOSN);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todos os CSOSNs
exports.getAllCSOSNs = async (req, res) => {
    try {
        const csosns = await CSOSN.find();
        res.json(csosns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar um CSOSN pelo ID
exports.getCSOSNById = async (req, res) => {
    try {
        const csosn = await CSOSN.findById(req.params.id);
        if (!csosn) {
            return res.status(404).json({ message: 'CSOSN não encontrado' });
        }
        res.json(csosn);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um CSOSN
exports.updateCSOSN = async (req, res) => {
    try {
        const csosn = await CSOSN.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!csosn) {
            return res.status(404).json({ message: 'CSOSN não encontrado' });
        }
        res.json(csosn);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deletar um CSOSN
exports.deleteCSOSN = async (req, res) => {
    try {
        const csosn = await CSOSN.findByIdAndDelete(req.params.id);
        if (!csosn) {
            return res.status(404).json({ message: 'CSOSN não encontrado' });
        }
        res.json({ message: 'CSOSN removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
