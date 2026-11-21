const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const randomString = crypto.randomUUID();
let currentStatus = `${new Date().toISOString()}: ${randomString}`;

const logRandomString = (timeInterval) => {
  const logString = () => {
    currentStatus = `${new Date().toISOString()}: ${randomString}`;
    console.log(currentStatus);
  };
  logString();
  setInterval(logString, timeInterval);
};

logRandomString(5000);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${currentStatus}\n`);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
