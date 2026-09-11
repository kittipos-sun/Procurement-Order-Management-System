const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const password = process.env.POMS_DB_PASSWORD || process.env.DB_PASSWORD || '';
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password,
  database: process.env.DB_NAME || 'poms_db',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

const cache = new Map();
const fileToCollection = {
  'users.json': 'users',
  'pr.json': 'purchase_requests',
  'po.json': 'purchase_orders',
  'asset.json': 'asset_receipts',
  'finance.json': 'finance',
  'db.json': 'database_snapshot'
};

async function initializeStore() {
  const admin = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password
  });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'poms_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();
  await pool.query(`CREATE TABLE IF NOT EXISTS poms_documents (
    collection_name VARCHAR(80) NOT NULL,
    document_id VARCHAR(120) NOT NULL,
    payload JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_name, document_id)
  ) ENGINE=InnoDB`);
  const { createRelationalSchema } = require('./relationalStore');
  await createRelationalSchema();
  for (const [file, collection] of Object.entries(fileToCollection)) {
    const filePath = file === 'users.json'
      ? path.join(__dirname, '..', 'api', 'Auth', file)
      : path.join(__dirname, '..', 'dummy', file);
    const [rows] = await pool.query('SELECT document_id, payload FROM poms_documents WHERE collection_name = ?', [collection]);
    if (rows.length === 0 && fs.existsSync(filePath)) {
      const source = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const entries = Array.isArray(source)
        ? source.map((value, index) => [String(value.userId || index), value])
        : Object.entries(source);
      for (const [id, payload] of entries) {
        await pool.query('INSERT INTO poms_documents (collection_name, document_id, payload) VALUES (?, ?, ?)', [collection, id, JSON.stringify(payload)]);
      }
    }
    await loadCollection(collection);
    const { syncRelational } = require('./relationalStore');
    await syncRelational(collection, cache.get(collection));
  }
}

async function loadCollection(collection) {
  const [rows] = await pool.query('SELECT document_id, payload FROM poms_documents WHERE collection_name = ?', [collection]);
  const parsePayload = value => {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch (_) { return value; }
  };
  if (collection === 'users') cache.set(collection, rows.map(row => parsePayload(row.payload)));
  else if (collection === 'finance') {
    // finance.json is an object with named sections.  The SQL store keeps
    // those sections as separate documents, so rebuild the original shape
    // instead of returning only the first row (which used to be `debts`).
    cache.set(collection, Object.fromEntries(
      rows.map(row => [row.document_id, parsePayload(row.payload)])
    ));
  }
  else cache.set(collection, Object.fromEntries(rows.map(row => [row.document_id, parsePayload(row.payload)])));
}

function collectionForFile(filePath) {
  return fileToCollection[path.basename(filePath)];
}

function readFileSync(filePath, encoding) {
  const collection = collectionForFile(filePath);
  if (!collection || !cache.has(collection)) return fs.readFileSync(filePath, encoding);
  return JSON.stringify(cache.get(collection), null, 2);
}

function writeFileSync(filePath, content) {
  const collection = collectionForFile(filePath);
  if (!collection) return fs.writeFileSync(filePath, content);
  const parsed = JSON.parse(content.toString());
  cache.set(collection, parsed);
  const entries = Array.isArray(parsed)
    ? parsed.map((value, index) => [String(value.userId || index), value])
    : Object.entries(parsed);
  void (async () => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM poms_documents WHERE collection_name = ?', [collection]);
      for (const [id, payload] of entries) {
        await connection.query('INSERT INTO poms_documents (collection_name, document_id, payload) VALUES (?, ?, ?)', [collection, id, JSON.stringify(payload)]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(`MySQL persistence failed for ${collection}:`, error.message);
    } finally { connection.release(); }
  })();
  void require('./relationalStore').syncRelational(collection, parsed);
}

module.exports = { initializeStore, readFileSync, writeFileSync, pool };
