const mongoose = require('mongoose');

// Definição do Schema
const ncmSchema = new mongoose.Schema({
  Codigo: {
    type: String,
    required: true,
  },
  Descricao: {
    type: String,
    required: true,
  },
  Data_Inicio: {
    type: Date,
    required: true,
  },
  Data_Fim: {
    type: Date,
    required: true,
  },
  Tipo_Ato_Ini: {
    type: String,
    required: true,
  },
  Numero_Ato_Ini: {
    type: String,
    required: true,
  },
  Ano_Ato_Ini: {
    type: Number,
    required: true,
  }
});

// Criando o modelo
const NCM = mongoose.model('NCM', ncmSchema);

module.exports = NCM;
