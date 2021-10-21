const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
  async all() {
    const {rows} = await db.query(sql`
    SELECT * FROM user_requests ORDER BY created_at DESC
    `);
    return rows;
  },
  async create(userId, body) {
    const {deliveryAddress, contactNumber, contactPerson} = body;
    try {
      const {rows} = await db.query(sql`
      INSERT INTO user_requests (
        id,
        user_id,
        delivery_address,
        contact_number,
        contact_person,
        status
      ) VALUES (
        ${uuidv4()},
        ${userId},
        ${deliveryAddress},
        ${contactNumber},
        ${contactPerson},
        'created'
      )
        RETURNING id, user_id, delivery_address, contact_number, contact_person, status;
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
  async updateStatus(id, status) {
    const {rows} = await db.query(sql`
    UPDATE user_requests SET status = ${status}, updated_at = ${new Date()} WHERE id=${id}
    RETURNING *;
    `);
    const [data] = rows;
    return data;
  },
  async find(userId) {
    const {rows} = await db.query(sql`
    SELECT * FROM user_requests WHERE user_id=${userId} LIMIT 1;
    `);
    return rows[0];
  },
  async findById(id) {
    const {rows} = await db.query(sql`
    SELECT * FROM user_requests WHERE id=${id} LIMIT 1;
    `);
    return rows[0];
  }
};
