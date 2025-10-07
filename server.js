// server.js
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// --------------------- Configuração do EJS ---------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --------------------- Middlewares -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --------------------- Inicializa Firebase ---------------------
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// --------------------- Rotas ---------------------

// Rota principal
app.get('/', (req, res) => res.send('Servidor rodando! Firebase conectado com sucesso.'));

// --------------------- Cursos ---------------------
app.get('/cursos', async (req, res) => {
    try {
        const snapshot = await db.ref('cursos').once('value');
        res.render('cursos_list', { cursos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send('Erro ao buscar cursos: ' + err.message);
    }
});

// --------------------- Alunos ---------------------
app.get('/alunos', async (req, res) => {
    try {
        const snapshot = await db.ref('alunos').once('value');
        res.render('alunos_list', { alunos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send('Erro ao buscar alunos: ' + err.message);
    }
});

// --------------------- Integrantes ---------------------
app.get('/integrantes', (req, res) => {
    res.render('integrantes');
});

// --------------------- Professores ---------------------

// Formulário para criar professor
app.get('/professores/create', (req, res) => {
    res.render('professores_create', { form: {}, error: null });
});

// Envio do formulário
app.post('/professores/create', async (req, res) => {
    try {
        const { nome, disciplina, email } = req.body;
        if (!nome || !disciplina || !email) throw new Error('Preencha todos os campos');

        const newRef = db.ref('professores').push();
        await newRef.set({ nome, disciplina, email });

        res.redirect('/professores/create');
    } catch (err) {
        res.render('professores_create', { form: req.body, error: err.message });
    }
});

// Listar professores
app.get('/professores', async (req, res) => {
    try {
        const snapshot = await db.ref('professores').once('value');
        res.render('professores_list', { professores: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send('Erro ao buscar professores: ' + err.message);
    }
});

// --------------------- Porta do servidor ---------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
