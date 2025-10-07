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

// ================== ROTAS ==================

// Raiz redirecionando para o formulário de professor
app.get('/', (req, res) => res.redirect('/professores/create'));

// Cursos
app.get('/cursos', async (req, res) => {
    try {
        const snapshot = await db.ref('cursos').once('value');
        const cursos = snapshot.val() || [];
        res.render('cursos', { cursos });
    } catch (err) {
        res.status(500).send('Erro ao carregar cursos: ' + err.message);
    }
});

// Alunos
app.get('/alunos', async (req, res) => {
    try {
        const snapshot = await db.ref('alunos').once('value');
        const alunos = snapshot.val() || [];
        res.render('alunos', { alunos });
    } catch (err) {
        res.status(500).send('Erro ao carregar alunos: ' + err.message);
    }
});

// Integrantes
app.get('/integrantes', (req, res) => res.render('integrantes'));

// Cadastrar Professor
app.get('/professores/create', (req, res) => res.render('create_professor', { form: {}, error: null }));

app.post('/professores/create', async (req, res) => {
    try {
        const { nome, disciplina, email } = req.body;
        if (!nome || !disciplina || !email) throw new Error('Preencha todos os campos');
        const newRef = db.ref('professores').push();
        await newRef.set({ nome, disciplina, email });
        res.redirect('/professores/create');
    } catch (err) {
        res.render('create_professor', { form: req.body, error: err.message });
    }
});

// ================== RODANDO O SERVIDOR ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
