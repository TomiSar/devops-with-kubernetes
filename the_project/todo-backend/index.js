const http = require('http');

const PORT = process.env.PORT || 3000;
const todos = [
  'Learn Kubernetes basics',
  'Deploy application to cluster',
  'Configure persistent volumes',
];

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(todos));
  } else if (req.method === 'POST' && req.url === '/todos') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const text = typeof parsed.todo === 'string' ? parsed.todo.trim() : '';
        if (!text || text.length > 140) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Todo must be 1–140 characters' }));
          return;
        }
        todos.push(text);
        res.writeHead(201, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(JSON.stringify({ todo: text }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => console.log(`Server started in port ${PORT}`));
