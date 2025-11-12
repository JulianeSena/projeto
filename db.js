//IMPORTAÇÃO DAS FUNÇÕES POSTGRES//
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

//ACESSO À BASE DE DADOS PELO USUÁRIO CRIADO//
const pool = new Pool({
  user: "celke_admin",
  host: "localhost",
  database: "celke",
  password: "senha1234",
  port: 5432,
});

export default pool;
