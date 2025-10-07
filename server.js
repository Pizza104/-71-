// server.js
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();


// Rota principal
app.get('/', (req, res) => {
    res.render('integrantes');
});


app.get('/cursos', async (req, res) => {
    try {
        const snapshot = await db.ref('cursos').once('value');
        res.render('cursos_list', { cursos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send('Erro ao buscar cursos: ' + err.message);
    }
});

app.get('/alunos', async (req, res) => {
    try {
        const snapshot = await db.ref('alunos').once('value');
        res.render('alunos_list', { alunos: snapshot.val() || [] });
    } catch (err) {
        res.status(500).send('Erro ao buscar alunos: ' + err.message);
    }
});

app.get('/integrantes', (req, res) => {
    res.render('integrantes');
});


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
        const data = snapshot.val() || {};

        // ✅ Converte o objeto retornado em array para evitar erro no EJS
        const professores = Object.values(data);

        res.render('professores_list', { professores });
    } catch (err) {
        res.status(500).send('Erro ao buscar professores: ' + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
