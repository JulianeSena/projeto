import express from 'express';
import pool from './db.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "model")));

const port = 8080;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/model/index.html'));
});

app.post('/cadastrar_usuario', async (req, res) => {
  const { nome_user, email_user, data_user, e_admin_user } = req.body;
  const sql = "INSERT INTO users (nome, email, data_nasc, e_admin) VALUES ($1, $2, $3, $4)";
  const values = [nome_user, email_user, data_user, e_admin_user];

  try {
    await pool.query(sql, values);
    res.redirect('/listar_usuarios');
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).send(`
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Erro no Cadastro</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Erro no Cadastro</h1>
        <p>Não foi possível cadastrar: ${err.message}</p>
        <a href="/">Voltar</a>
      </body>
      </html>
    `);
  }
});

app.post('/excluir_usuario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "DELETE FROM users WHERE id = $1";
    const values = [id];
    const result = await pool.query(sql, values);

    if (result.rowCount > 0) {
      res.redirect('/listar_usuarios');
    } else {
      res.status(404).send(`
        <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <title>Usuário não encontrado</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <h1>Usuário não encontrado</h1>
          <a href="/listar_usuarios">Voltar</a>
        </body>
        </html>
      `);
    }
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).send(`
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Erro no Servidor</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Erro no Servidor</h1>
        <p>${err.message}</p>
        <a href="/listar_usuarios">Voltar</a>
      </body>
      </html>
    `);
  }
});

app.get('/editar_usuario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT id, nome, email, data_nasc, e_admin FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('<h1>Usuário não encontrado</h1>');
    }

    const uUsuario = result.rows[0];
    res.send(`
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Editar Usuário</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Editar Usuário</h1>
        <form action="/editar_usuario/${uUsuario.id}" method="post">
          <label>
            <p>Nome</p>
            <input type="text" name="nome_user" value="${uUsuario.nome}">
          </label>
          <label>
            <p>E-mail</p>
            <input type="email" name="email_user" value="${uUsuario.email}">
          </label>
          <label>
            <p>Data de nascimento</p>
            <input type="date" name="data_user" value="${uUsuario.data_nasc}">
          </label>
          <label style="display: flex;">
            <p>É administrador?</p>
            <input type="checkbox" name="e_admin_user" value="true" ${uUsuario.e_admin ? 'checked' : ''}>
          </label>
          <br>
          <label>
            <button type="submit">Salvar</button>
          </label>
        </form>
        <a href="/listar_usuarios">Cancelar</a>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).send('Erro interno do servidor.');
  }
});

app.post('/editar_usuario/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_user, email_user, data_user, e_admin_user } = req.body;
  const isAdmin = e_admin_user === 'on' || e_admin_user === 'true';
  const isdataNasc = data_user && data_user !== '' ? data_user : null;

  try {
    const sql = "UPDATE users SET nome = $1, email = $2, data_nasc = $3, e_admin = $4 WHERE id = $5";
    const values = [nome_user, email_user, isdataNasc, isAdmin, id];
    const result = await pool.query(sql, values);

    if (result.rowCount > 0) {
      res.redirect('/listar_usuarios');
    } else {
      res.status(404).send('<h1>Usuário não encontrado</h1>');
    }
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send(`
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Erro ao Atualizar</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Erro ao atualizar</h1>
        <p>${err.message}</p>
      </body>
      </html>
    `);
  }
});

app.get('/listar_usuarios', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT nome, email, id, data_nasc, e_admin FROM users');
    const usuarios = result.rows;

    let html = `
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <title>Lista de Usuários</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <h1>Usuários Cadastrados</h1>
        <table>
          <tr>
            <th>Nome</th><th>Email</th><th>Data de Nascimento</th><th>Administrador</th><th>Ações</th>
          </tr>`;
    
    usuarios.forEach(u => {
      html += `
        <tr>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td>${u.data_nasc || '-'}</td>
          <td>${u.e_admin ? 'Sim' : 'Não'}</td>
          <td>
            <form action="/editar_usuario/${u.id}" method="get">
              <button type="submit">Editar</button>
            </form>
            <form action="/excluir_usuario/${u.id}" method="post">
              <button type="submit">Excluir</button>
            </form>
          </td>
        </tr>`;
    });

    html += `
        </table>
        <a href="/">Voltar ao Cadastro</a>
      </body>
      </html>`;

    res.send(html);
    client.release();
  } catch (err) {
    console.error('Erro ao executar consulta:', err);
    res.status(500).send(`<h1>Erro interno do servidor: ${err.message}</h1>`);
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
