const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
  async create(username, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const {rows} = await db.query(sql`
      INSERT INTO users (id, username, password)
        VALUES (${uuidv4()}, ${username}, ${hashedPassword})
        RETURNING id, username;
      `);

      const [user] = rows;
      return user;
    } catch (error) {
      if (error.constraint === 'users_username_key') {
        return null;
      }

      throw error;
    }
  },
  async find(username) {
    const {rows} = await db.query(sql`
    SELECT id, username, role FROM users WHERE username=${username} LIMIT 1;
    `);
    return rows[0];
  },
  async findWithPassword(username) {
    const {rows} = await db.query(sql`
    SELECT * FROM users WHERE username=${username} LIMIT 1;
    `);
    return rows[0];
  },
  async findById(id) {
    const {rows} = await db.query(sql`
    SELECT id, username, role FROM users WHERE id=${id} LIMIT 1;
    `);
    return rows[0];
  }
};
