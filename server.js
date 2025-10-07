// server.js
console.log('Servidor inicializando...');
const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config(); // garante que variáveis de ambiente sejam carregadas

const app = express();
app.use(express.json());

// Inicializa o Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// Rotas de teste
app.get('/', (req, res) => {
    res.send('Servidor rodando! Firebase conectado com sucesso.');
});

// Exemplo: gravar dados no Realtime Database
app.post('/add', async (req, res) => {
    try {
        const { path, data } = req.body; // Ex.: { path: 'users/user1', data: { name: 'Kaue' } }
        await db.ref(path).set(data);
        res.status(200).send({ message: 'Dados adicionados com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

// Exemplo: ler dados do Realtime Database
app.get('/get', async (req, res) => {
    try {
        const { path } = req.query; // Ex.: /get?path=users/user1
        const snapshot = await db.ref(path).once('value');
        res.status(200).send(snapshot.val());
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

// Porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
