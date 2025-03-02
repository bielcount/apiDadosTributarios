require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const cfopRoutes = require('./routes/cfopRoute');
const csosnRoutes = require('./routes/csosnRoute');
const cstRoutes = require('./routes/cstRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB Atlas');
}).catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
});

// Rotas
app.use('/api/cfop', cfopRoutes);
app.use('/api/csosn', csosnRoutes);
app.use('/api/cst', cstRoutes);

// Rota principal
app.get('/', (req, res) => {
    res.send('API de Códigos Fiscais Rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
