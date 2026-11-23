const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const directory = '/usr/src/app/files';
const filePath = path.join(directory, 'count.txt');

fs.mkdirSync(directory, { recursive: true });

let counter = 0;
if (fs.existsSync(filePath)) {
  const saved = parseInt(fs.readFileSync(filePath, 'utf8'), 10);
  if (!Number.isNaN(saved)) {
    counter = saved;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`pong ${counter}\n`);
    counter += 1;
    fs.writeFileSync(filePath, String(counter));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => console.log(`Server started in port ${PORT}`));
