// server.js
const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (CSS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inicializa Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});
const db = admin.database();

// Rota raiz
app.get('/', (req, res) => res.send('Servidor rodando! Firebase conectado com sucesso.'));

// Cursos
app.get('/cursos', async (req, res) => {
    try {
        const snapshot = await db.ref('cursos').once('value');
        res.render('cursos_list', { cursos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Alunos
app.get('/alunos', async (req, res) => {
    try {
        const snapshot = await db.ref('alunos').once('value');
        res.render('alunos_list', { alunos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Integrantes
app.get('/integrantes', (req, res) => res.render('integrantes'));

// Professores - Criar
app.get('/professores/create', (req, res) => {
    res.render('professores_create', { form: {}, error: null });
});

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

// Professores - Listar
app.get('/professores', async (req, res) => {
    try {
        const snapshot = await db.ref('professores').once('value');
        res.render('professores_list', { professores: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
