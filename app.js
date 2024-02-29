const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();
const PORT = 8080;

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do EJS como mecanismo de visualização
app.set('view engine', 'ejs');

// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: true,
    saveUninitialized: true
}));

// Configuração do MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'vinicius',
    database: 'mydb'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida');
});

// Rota GET para a página de login
app.get('/login', (req, res) => {
    res.render('login');
});

// Rota POST para a página de login
app.post('/login', (req, res) => {
    const { nome_usuario, senha } = req.body;
    // Consulta ao banco de dados para autenticação do usuário
    const query = `SELECT * FROM usuarios WHERE nome_usuario = ? AND senha = ?`;
    connection.query(query, [nome_usuario, senha], (err, results) => {
        if (err || results.length === 0) {
            res.redirect('/login');
          } else {
            req.session.usuarioId = results[0].id; // Armazena o ID do usuário na sessão
            req.session.logged_in = true;
            res.redirect('/postagens');
        }
    });
});

// Middleware para verificar se o usuário está autenticado
function autenticacao(req, res, next) {
    if (req.session && req.session.logged_in) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Rota GET para a página de postagens (requer autenticação)
app.get('/postagens', autenticacao, (req, res) => {
  // Consulta ao banco de dados para obter as postagens
  const query = `SELECT * FROM postagens`;
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erro ao obter postagens:', err);
          res.redirect('/postagens');
      } else {
          // Renderiza a página de postagens e passa as postagens como parte do objeto de contexto
          res.render('postagens', { postagens: results });
      }
  });
});


// Rota POST para criar uma nova postagem
app.post('/postagens', autenticacao, (req, res) => {
  const { titulo, conteudo } = req.body;
  const usuarioId = req.session.usuarioId; // Supondo que você armazene o ID do usuário na sessão
  // Insira os dados da postagem no banco de dados
  const query = `INSERT INTO postagens (titulo, conteudo, usuario_id) VALUES (?, ?, ?)`;
  connection.query(query, [titulo, conteudo, usuarioId], (err, results) => {
      if (err) {
          console.error('Erro ao inserir postagem:', err);
          res.redirect('/postagens');
      } else {
          res.redirect('/postagens');
      }
  });
});


// Rota para excluir uma postagem
app.post('/postagens/:id/excluir', autenticacao, (req, res) => {
  const postId = req.params.id;
  const usuarioId = req.session.usuarioId; // Supondo que você armazene o ID do usuário na sessão
  // Exclua a postagem do banco de dados apenas se pertencer ao usuário logado
  const query = `DELETE FROM postagens WHERE id = ? AND usuario_id = ?`;
  connection.query(query, [postId, usuarioId], (err, results) => {
      if (err) {
          console.error('Erro ao excluir postagem:', err);
          res.redirect('/postagens');
      } else {
          res.redirect('/postagens');
      }
  });
});

// Rota GET para a página de postagens
app.get('/postagens', autenticacao, (req, res) => {
  // Consulta ao banco de dados para obter as postagens
  const query = `SELECT * FROM postagens`;
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erro ao obter postagens:', err);
          res.redirect('/postagens');
      } else {
          // Renderiza a página de postagens e passa as postagens como parte do objeto de contexto
          res.render('postagens', { postagens: results });
      }
  });
});


// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Páginas
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/sobre', (req, res) => {
  res.render('sobre');
});

app.get('/contato', (req, res) => {
  res.render('contato');
});
