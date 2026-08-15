import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fileDirName from '../utils/fileDirName.js';

dotenv.config();

let dbType = 'mysql';
let pool = null;
let sqliteDb = null;

const { __dirname } = fileDirName(import.meta.url);

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'store_rating_db';

  try {
    // 1. Attempt MySQL initialization
    const tempConnection = await mysql.createConnection({ host, port, user, password });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await tempConnection.end();

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const conn = await pool.getConnection();
    conn.release();
    dbType = 'mysql';
    console.log(`[DB] Successfully connected to MySQL database "${database}".`);
  } catch (err) {
    console.warn(`[DB] MySQL connection failed (${err.message}). Falling back to embedded SQLite database.`);
    dbType = 'sqlite';

    const dbPath = path.join(__dirname, '..', 'store_rating.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);

    // Enable foreign keys
    await new Promise((resolve, reject) => {
      sqliteDb.run('PRAGMA foreign_keys = ON;', (e) => (e ? reject(e) : resolve()));
    });
    console.log(`[DB] Successfully connected to SQLite database at ${dbPath}.`);
  }

  // Create tables schema
  await createTables();
}

async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [rows] = await pool.query(sql, params);
    return rows;
  } else {
    // Convert MySQL queries to SQLite compatible if needed
    let adaptedSql = sql
      .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
      .replace(/CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'CURRENT_TIMESTAMP');

    return new Promise((resolve, reject) => {
      const trimmed = adaptedSql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        sqliteDb.all(adaptedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(adaptedSql, params, function (err) {
          if (err) return reject(err);
          // Return format matching mysql2 output where possible
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        });
      }
    });
  }
}

async function createTables() {
  const usersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'NORMAL_USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const storesTableSql = `
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(400) NOT NULL,
      owner_id INT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `;

  const ratingsTableSql = `
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, store_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    );
  `;

  const jwtTokensTableSql = `
    CREATE TABLE IF NOT EXISTS jwt_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token TEXT NOT NULL,
      ip_address VARCHAR(45),
      user_agent VARCHAR(255),
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      expires_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await query(usersTableSql);
  await query(storesTableSql);
  await query(ratingsTableSql);
  await query(jwtTokensTableSql);
  console.log('[DB] Database tables verified/created successfully.');
}

export default {
  initDb,
  query,
  getDbType: () => dbType
};
