const express = require('express');
const moment = require('moment'); // Importa o moment para conversão de datas
const router = express.Router();
const NCM = require('../models/ncmModel');

// Buscar todos os NCMs
router.get('/', async (req, res) => {
    try {
        const ncms = await NCM.find();
        res.json(ncms);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar NCMs' });
    }
});

// Buscar NCM pelo código
router.get('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const ncmEncontrado = await NCM.findOne({ Codigo: codigo });

        if (!ncmEncontrado) {
            return res.status(404).json({ mensagem: 'NCM não encontrado' });
        }

        res.json(ncmEncontrado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar NCM' });
    }
});

// Criar novo NCM
router.post('/', async (req, res) => {
    try {
        const { Codigo, Descricao, Data_Inicio, Data_Fim, Tipo_Ato_Ini, Numero_Ato_Ini, Ano_Ato_Ini } = req.body;
        
        // Verificar se todos os campos obrigatórios estão presentes
        if (!Codigo || !Descricao || !Data_Inicio || !Data_Fim || !Tipo_Ato_Ini || !Numero_Ato_Ini || !Ano_Ato_Ini) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        // Converter as datas do formato DD-MM-YYYY para ISODate
        const dataInicioConvertida = moment(Data_Inicio, 'DD-MM-YYYY');
        const dataFimConvertida = moment(Data_Fim, 'DD-MM-YYYY');

        // Verificar se a conversão deu certo
        if (!dataInicioConvertida.isValid() || !dataFimConvertida.isValid()) {
            return res.status(400).json({ erro: 'Formato de data inválido' });
        }

        const ncmExistente = await NCM.findOne({ Codigo });
        if (ncmExistente) {
            return res.status(400).json({ erro: 'NCM já existe' });
        }

        const novoNCM = new NCM({
            Codigo,
            Descricao,
            Data_Inicio: dataInicioConvertida.toDate(), // Converter para objeto Date
            Data_Fim: dataFimConvertida.toDate(), // Converter para objeto Date
            Tipo_Ato_Ini,
            Numero_Ato_Ini,
            Ano_Ato_Ini,
        });

        await novoNCM.save();
        res.status(201).json(novoNCM);
    } catch (error) {
        // Exibir o erro completo no console para análise
        console.error("Erro ao criar NCM:", error);
        res.status(500).json({ erro: 'Erro ao criar NCM', detalhes: error.message });
    }
});

// Criar múltiplos NCMs
router.post('/bulk', async (req, res) => {
    try {
        const ncmArray = req.body;  // Espera um array de objetos NCM

        if (!Array.isArray(ncmArray) || ncmArray.length === 0) {
            return res.status(400).json({ erro: 'Deve ser enviado um array de NCMs' });
        }

        const bulkOps = [];
        let ncmExistenteCount = 0;  // Contador para NCMs existentes
        let ncmInseridoCount = 0;   // Contador para NCMs inseridos

        for (const ncm of ncmArray) {
            const { Codigo, Descricao, Data_Inicio, Data_Fim, Tipo_Ato_Ini, Numero_Ato_Ini, Ano_Ato_Ini } = ncm;

            // Verificação básica dos campos
            if (!Codigo || !Descricao || !Data_Inicio || !Data_Fim || !Tipo_Ato_Ini || !Numero_Ato_Ini || !Ano_Ato_Ini) {
                throw new Error('Todos os campos são obrigatórios para cada NCM');
            }

            const dataInicioConvertida = moment(Data_Inicio, 'DD-MM-YYYY');
            const dataFimConvertida = moment(Data_Fim, 'DD-MM-YYYY');

            if (!dataInicioConvertida.isValid() || !dataFimConvertida.isValid()) {
                throw new Error('Formato de data inválido');
            }

            const ncmExistente = await NCM.findOne({ Codigo });

            if (ncmExistente) {
                ncmExistenteCount++; // Se já existir, incrementa o contador de NCMs existentes
            } else {
                bulkOps.push({
                    updateOne: {
                        filter: { Codigo },
                        update: { 
                            Codigo,
                            Descricao,
                            Data_Inicio: dataInicioConvertida.toDate(),
                            Data_Fim: dataFimConvertida.toDate(),
                            Tipo_Ato_Ini,
                            Numero_Ato_Ini,
                            Ano_Ato_Ini
                        },
                        upsert: true // Se não encontrar, cria o NCM
                    }
                });
            }
        }

        // Realiza a operação bulkWrite
        if (bulkOps.length > 0) {
            const result = await NCM.bulkWrite(bulkOps);
            ncmInseridoCount = result.upsertedCount; // NCMs inseridos
        }

        res.status(200).json({ 
            mensagem: `${ncmExistenteCount} NCMs já existem no banco e ${ncmInseridoCount} NCMs inseridos/atualizados com sucesso`
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar múltiplos NCMs', detalhes: error.message });
    }
});




// Atualizar NCM
router.put('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { Descricao, Data_Inicio, Data_Fim, Tipo_Ato_Ini, Numero_Ato_Ini, Ano_Ato_Ini } = req.body;

        // Converter as datas do formato DD-MM-YYYY para ISODate
        const dataInicioConvertida = moment(Data_Inicio, 'DD-MM-YYYY').toDate();
        const dataFimConvertida = moment(Data_Fim, 'DD-MM-YYYY').toDate();

        // Verificar se a conversão deu certo
        if (!dataInicioConvertida.isValid() || !dataFimConvertida.isValid()) {
            return res.status(400).json({ erro: 'Formato de data inválido' });
        }

        const ncmAtualizado = await NCM.findOneAndUpdate(
            { Codigo: codigo },
            { Descricao, Data_Inicio: dataInicioConvertida, Data_Fim: dataFimConvertida, Tipo_Ato_Ini, Numero_Ato_Ini, Ano_Ato_Ini },
            { new: true }
        );

        if (!ncmAtualizado) {
            return res.status(404).json({ erro: 'NCM não encontrado' });
        }

        res.json(ncmAtualizado);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar NCM' });
    }
});

// Excluir NCM
router.delete('/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const ncmExcluido = await NCM.findOneAndDelete({ Codigo: codigo });

        if (!ncmExcluido) {
            return res.status(404).json({ erro: 'NCM não encontrado' });
        }

        res.json({ mensagem: 'NCM excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir NCM' });
    }
});

module.exports = router;
