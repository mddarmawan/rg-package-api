const sql = require('sql-template-strings');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const db = require('./db');

const ensureMigrationsTable = (db) =>
  db.query(
    'CREATE TABLE IF NOT EXISTS migrations (id integer PRIMARY KEY, data jsonb NOT NULL)'
  );

const postgresStateStorage = {
  async load(fn) {
    await db.connect();

    await ensureMigrationsTable(db);
    const {rows} = await db.query('SELECT data FROM migrations');

    if (rows.length !== 1) {
      return fn(null, {});
    }

    fn(null, rows[0].data);
  },

  async save(set, fn) {
    await db.connect();

    await ensureMigrationsTable(db);

    const migrationMetaData = {
      lastRun: set.lastRun,
      migrations: set.migrations
    };

    await db.query(sql`
      INSERT INTO migrations (id, data)
      VALUES (1, ${migrationMetaData})
      ON CONFLICT (id) DO UPDATE SET data = ${migrationMetaData}
    `);

    const usersToBeCreated = [{
      user: 'admin',
      pass: '1234',
      role: 'admin',
    }, {
      user: 'anugrahaman71',
      pass: '1234',
      role: 'user',
    }, {
      user: 'rahelpratama413',
      pass: '1234',
      role: 'user',
    }, {
      user: 'aisyahrodiah354',
      pass: '1234',
      role: 'user',
    }, {
      user: 'donomargonobegono97',
      pass: '1234',
      role: 'user',
    }];

    await Promise.allSettled(usersToBeCreated.map(async (item) => {
      return db.query(sql`
        INSERT INTO users (id, username, password, role)
        VALUES (${uuidv4()}, ${item.user}, ${await bcrypt.hash(item.pass, 10)}, ${item.role})
        RETURNING id, username;
      `);
    }));

    fn();
  }
};

module.exports = Object.assign(() => {
  return postgresStateStorage;
}, postgresStateStorage);
