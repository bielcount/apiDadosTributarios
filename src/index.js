// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const cfopRoutes = require('./routes/cfopRoute');
const csosnRoutes = require('./routes/csosnRoute');
const cstRoutes = require('./routes/cstRoute');
const ncmRoutes = require('./routes/ncmRoute'); // Importa a rota do NCM

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Testar se a variável MONGO_URI está sendo lida
console.log("Tentando conectar ao MongoDB com URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
    console.error("ERRO: MONGO_URI não definida!");
    process.exit(1);
}

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');
}).catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
});

// Rotas
app.use('/api/cfop', cfopRoutes);
app.use('/api/csosn', csosnRoutes);
app.use('/api/cst', cstRoutes);
app.use('/api/ncm', ncmRoutes); // Registra a rota do NCM

// Rota principal
app.get('/', (req, res) => {
    res.send('API de Códigos Fiscais Rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
