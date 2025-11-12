CREATE TABLE users(
	nome VARCHAR(200) NOT NULL,
	email VARCHAR(200) NOT NULL,
	id SERIAL NOT NULL
);

CREATE ROLE celke_admin
login
password 'senha1234';

GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE users TO celke_admin;
GRANT ALL PRIVILEGES ON TABLE users TO celke_admin;
ALTER TABLE users OWNER TO celke_admin;

-- inserção de teste
INSERT INTO celke (nome, email) VALUES ("Teste", "teste@gmail.com");
INSERT INTO celke (nome, email) VALUES ("Teste2", "teste2@gmail.com");

SELECT * FROM users;

ALTER TABLE users
ADD COLUMN data_nasc DATE,
ADD COLUMN e_admin BOOLEAN DEFAULT FALSE;