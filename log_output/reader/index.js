const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const filePath = path.join('/usr/src/app/files', 'output.txt');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(content);
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
