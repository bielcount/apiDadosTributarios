const mongoose = require('mongoose');

const csosnSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    descricao: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CSOSN', csosnSchema);
