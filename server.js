// server.js
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 Inicializando Firebase Admin a partir da variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});


// Inicializar Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();
console.log("✅ Conectado ao Firebase Realtime Database!");

/* ---------- Rotas ---------- */

// Home -> redireciona para Integrantes
app.get('/integrantes', (req, res) => {
    const integrantes = [
        { nome: 'Kaua', foto: '/images/integrante_1.png' },
        { nome: 'João', foto: '/images/integrante_2.png' }
    ];
    res.render('integrantes', { integrantes });
});

/* Professores - List */
app.get('/professores', async (req, res) => {
    try {
        const snap = await db.ref('professores').once('value');
        const data = snap.val() || {};
        const professores = Object.entries(data).map(([id, v]) => ({ id, ...v }));
        res.render('professores_list', { professores });
    } catch (err) {
        res.status(500).send('Erro ao buscar professores: ' + err.message);
    }
});

/* Professores - Create (form) */
app.get('/professores/create', (req, res) => {
    res.render('professores_create', { error: null, form: {} });
});

/* Professores - Create (POST) */
app.post('/professores/create', async (req, res) => {
    const { nome, disciplina, email } = req.body;
    if (!nome || !disciplina || !email) {
        return res.render('professores_create', { error: 'Preencha todos os campos', form: req.body });
    }
    try {
        await db.ref('professores').push({ nome, disciplina, email });
        res.redirect('/professores');
    } catch (err) {
        res.status(500).send('Erro ao cadastrar: ' + err.message);
    }
});

/* Cursos - list */
app.get('/cursos', async (req, res) => {
    try {
        const snap = await db.ref('cursos').once('value');
        const data = snap.val() || {};
        const cursos = Object.entries(data).map(([id, v]) => ({ id, ...v }));
        res.render('cursos_list', { cursos });
    } catch (err) {
        res.status(500).send('Erro ao buscar cursos: ' + err.message);
    }
});

/* Alunos - list */
app.get('/alunos', async (req, res) => {
    try {
        const snap = await db.ref('alunos').once('value');
        const data = snap.val() || {};
        const alunos = Object.entries(data).map(([id, v]) => ({ id, ...v }));
        res.render('alunos_list', { alunos });
    } catch (err) {
        res.status(500).send('Erro ao buscar alunos: ' + err.message);
    }
});

/* Start server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
