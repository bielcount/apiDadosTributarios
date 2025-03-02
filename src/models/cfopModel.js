const mongoose = require('mongoose');

const cfopSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    descricao: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Entrada', 'Saída'] }
}, { timestamps: true });

module.exports = mongoose.model('CFOP', cfopSchema);
