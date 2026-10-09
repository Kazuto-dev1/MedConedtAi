const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', '..', '..', 'db', 'sqlite', 'medconecta.dev.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const uuid = () => crypto.randomUUID();

const ESPECIALIDADES = ['Ginecologia', 'Clinica Geral', 'Cardiologia', 'Dermatologia', 'Pediatria'];

function upsertEspecialidade(nome) {
  const found = db.prepare('SELECT id FROM especialidade WHERE nome = ?').get(nome);
  if (found) return found.id;
  const id = uuid();
  db.prepare('INSERT INTO especialidade (id, nome) VALUES (?, ?)').run(id, nome);
  return id;
}

const especialidade = {};
for (const nome of ESPECIALIDADES) {
  especialidade[nome] = upsertEspecialidade(nome);
}

const profissionais = [
  { nome: 'Dr. Ricardo Almeida', email: 'ricardo@teste.com', crm: 'CRM-12345', esp: 'Ginecologia', dias: [1, 3, 5], inicio: '09:00', fim: '12:00', preco: 250, local: 'Clinica Centro' },
  { nome: 'Dra. Beatriz Nunes', email: 'beatriz@teste.com', crm: 'CRM-12346', esp: 'Ginecologia', dias: [2, 4], inicio: '13:00', fim: '17:00', preco: 260, local: 'Clinica Centro' },
  { nome: 'Dra. Camila Rocha', email: 'camila@teste.com', crm: 'CRM-12347', esp: 'Ginecologia', dias: [1, 2, 4], inicio: '08:00', fim: '12:00', preco: 230, local: 'Unidade Zona Norte' },
  { nome: 'Dra. Ana Souza', email: 'ana@teste.com', crm: 'CRM-23456', esp: 'Clinica Geral', dias: [1, 2, 4], inicio: '14:00', fim: '18:00', preco: 180, local: 'Clinica Sul' },
  { nome: 'Dr. Diego Farias', email: 'diego@teste.com', crm: 'CRM-23457', esp: 'Clinica Geral', dias: [3, 5], inicio: '08:00', fim: '12:00', preco: 170, local: 'Clinica Sul' },
  { nome: 'Dra. Elisa Martins', email: 'elisa@teste.com', crm: 'CRM-23458', esp: 'Clinica Geral', dias: [1, 2, 3, 4, 5], inicio: '08:00', fim: '11:00', preco: 150, local: 'Unidade Zona Leste' },
  { nome: 'Dr. Carlos Lima', email: 'carlos@teste.com', crm: 'CRM-34567', esp: 'Cardiologia', dias: [2, 4], inicio: '08:00', fim: '12:00', preco: 320, local: 'Hospital Norte' },
  { nome: 'Dra. Fernanda Alves', email: 'fernanda@teste.com', crm: 'CRM-34568', esp: 'Cardiologia', dias: [1, 3, 5], inicio: '13:00', fim: '17:00', preco: 300, local: 'Hospital Norte' },
  { nome: 'Dr. Gabriel Prado', email: 'gabriel@teste.com', crm: 'CRM-34569', esp: 'Cardiologia', dias: [2, 4, 6], inicio: '09:00', fim: '13:00', preco: 280, local: 'Clinica Sul' },
  { nome: 'Dra. Helena Costa', email: 'helena@teste.com', crm: 'CRM-45670', esp: 'Dermatologia', dias: [1, 3, 5], inicio: '09:00', fim: '12:00', preco: 220, local: 'Clinica Centro' },
  { nome: 'Dr. Igor Ramos', email: 'igor@teste.com', crm: 'CRM-45671', esp: 'Dermatologia', dias: [2, 4], inicio: '14:00', fim: '18:00', preco: 240, local: 'Unidade Zona Leste' },
  { nome: 'Dra. Julia Prado', email: 'julia@teste.com', crm: 'CRM-45672', esp: 'Dermatologia', dias: [3, 5, 6], inicio: '08:00', fim: '11:00', preco: 210, local: 'Clinica Sul' },
  { nome: 'Dr. Kleber Souza', email: 'kleber@teste.com', crm: 'CRM-56780', esp: 'Pediatria', dias: [1, 2, 3, 4, 5], inicio: '08:00', fim: '12:00', preco: 190, local: 'Clinica Centro' },
  { nome: 'Dra. Larissa Melo', email: 'larissa@teste.com', crm: 'CRM-56781', esp: 'Pediatria', dias: [2, 4], inicio: '13:00', fim: '18:00', preco: 200, local: 'Unidade Zona Norte' },
  { nome: 'Dr. Marcos Dias', email: 'marcos@teste.com', crm: 'CRM-56782', esp: 'Pediatria', dias: [1, 3, 5, 6], inicio: '09:00', fim: '12:00', preco: 175, local: 'Clinica Sul' },
];

function criarProfissional(p) {
  let usuarioId;
  const usuario = db.prepare('SELECT id FROM usuario WHERE email = ?').get(p.email);
  if (usuario) {
    usuarioId = usuario.id;
  } else {
    usuarioId = uuid();
    const hash = bcrypt.hashSync('senha12345', 10);
    db.prepare(
      'INSERT INTO usuario (id, email, senha_hash, tipo, consentimento_lgpd) VALUES (?, ?, ?, ?, ?)',
    ).run(usuarioId, p.email, hash, 'profissional', 1);
  }

  let profId;
  const prof = db.prepare('SELECT id FROM profissional WHERE usuario_id = ?').get(usuarioId);
  if (prof) {
    profId = prof.id;
  } else {
    profId = uuid();
    db.prepare(
      'INSERT INTO profissional (id, usuario_id, nome, registro_crm, registro_validado, bio, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(profId, usuarioId, p.nome, p.crm, 1, `Especialista em ${p.esp}.`, 1);
  }

  const temAgenda = db.prepare('SELECT COUNT(*) AS c FROM agenda WHERE profissional_id = ?').get(profId).c;
  if (temAgenda === 0) {
    const ins = db.prepare(
      'INSERT INTO agenda (id, profissional_id, especialidade_id, local, dia_semana, hora_inicio, hora_fim, preco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const dia of p.dias) {
      ins.run(uuid(), profId, especialidade[p.esp], p.local, dia, p.inicio, p.fim, p.preco);
    }
  }
}

const seed = db.transaction(() => {
  for (const p of profissionais) {
    criarProfissional(p);
  }
});
seed();

const porEspecialidade = db
  .prepare(
    `SELECT e.nome AS esp, COUNT(DISTINCT a.profissional_id) AS total
     FROM especialidade e
     LEFT JOIN agenda a ON a.especialidade_id = e.id
     GROUP BY e.nome ORDER BY e.nome`,
  )
  .all();

console.log('Seed concluido.');
console.log('Profissionais por especialidade:');
for (const r of porEspecialidade) {
  console.log(' -', r.esp + ':', r.total);
}
console.log('Total profissionais:', db.prepare('SELECT COUNT(*) AS c FROM profissional').get().c);
console.log('Login: <email> / senha12345');
db.close();
