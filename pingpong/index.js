const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  while (true) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pings (
          id INTEGER PRIMARY KEY,
          count INTEGER NOT NULL
        );
      `);
      await pool.query(`
        INSERT INTO pings (id, count)
        VALUES (1, 0)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('Database initialized successfully');
      break;
    } catch (err) {
      console.error('Waiting for database...', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/pingpong') {
      const result = await pool.query('SELECT count FROM pings WHERE id = 1');
      const current = result.rows[0].count;
      await pool.query('UPDATE pings SET count = count + 1 WHERE id = 1');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`pong ${current}\n`);
    } else if (req.method === 'GET' && req.url === '/pings') {
      const result = await pool.query('SELECT count FROM pings WHERE id = 1');
      const current = result.rows[0].count;
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`${current}`);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found\n');
    }
  } catch (err) {
    console.error('Database query error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error\n');
  }
});

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
  });
});
