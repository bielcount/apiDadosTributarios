const mongoose = require('mongoose');

const cstSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    descricao: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CST', cstSchema);
