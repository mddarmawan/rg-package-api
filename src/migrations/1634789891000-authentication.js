const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    username text UNIQUE,
    password text,
    role text,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp default null
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp default null
  );

  CREATE TABLE IF NOT EXISTS user_requests (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE,
    delivery_address text,
    contact_number text,
    contact_person text,
    status text,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp default null
  )
  `);

  await client.query(`
  CREATE INDEX users_username on users (username);

  CREATE INDEX sessions_user on sessions (user_id);
  `);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE user_requests;
  DROP TABLE sessions;
  DROP TABLE users;
  `);

  await client.release(true);
  next();
};
