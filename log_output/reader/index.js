const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const statusPath = path.join('/usr/src/app/files', 'output.txt');
const infoPath = path.join('/usr/src/app/config', 'information.txt');
const PINGPONG_URL =
  process.env.PINGPONG_URL || 'http://pingpong-svc:2345/pings';

const getPings = () =>
  new Promise((resolve) => {
    http
      .get(PINGPONG_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data.trim() || '0'));
      })
      .on('error', (err) => {
        console.error('Error fetching pings:', err.message);
        resolve('0');
      });
  });

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    try {
      const status = fs.readFileSync(statusPath, 'utf8').trim();
      const count = await getPings();
      const fileContent = fs.existsSync(infoPath)
        ? fs.readFileSync(infoPath, 'utf8').trim()
        : '';
      const message = process.env.MESSAGE || '';

      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(
        `file content: ${fileContent}\n` +
          `env variable: MESSAGE=${message}\n` +
          `${status}.\n` +
          `Ping / Pongs: ${count}\n`,
      );
    } catch (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Status file not ready yet\n');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => console.log(`Server started in port ${PORT}`));
