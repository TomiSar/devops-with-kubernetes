const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const directory = '/usr/src/app/files';
const imagePath = path.join(directory, 'image.jpg');
const CACHE_DURATION_MS = 10 * 60 * 1000;

fs.mkdirSync(directory, { recursive: true });

let isFetching = false;

const downloadImage = (url) => {
  if (isFetching) return;
  isFetching = true;

  const fetchUrl = (targetUrl) => {
    https
      .get(targetUrl, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          fetchUrl(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          console.error(`Failed to download image: HTTP ${res.statusCode}`);
          isFetching = false;
          return;
        }

        const tempPath = `${imagePath}.tmp`;
        const fileStream = fs.createWriteStream(tempPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            fs.renameSync(tempPath, imagePath);
            console.log('New image cached successfully');
            isFetching = false;
          });
        });
      })
      .on('error', (err) => {
        console.error('Error downloading image:', err.message);
        isFetching = false;
      });
  };

  fetchUrl(url);
};

const ensureImage = () => {
  if (!fs.existsSync(imagePath)) {
    downloadImage('https://picsum.photos/1200');
    return false;
  }
  const stats = fs.statSync(imagePath);
  const ageMs = Date.now() - stats.mtimeMs;
  if (ageMs > CACHE_DURATION_MS) {
    downloadImage('https://picsum.photos/1200');
  }
  return true;
};

ensureImage();

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    ensureImage();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>The Project</title>
          <style>
            body {
              font-family: sans-serif;
              max-width: 600px;
              margin: 2rem auto;
              text-align: center;
              color: #222;
            }
            img {
              max-width: 300px;
              border-radius: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              margin-bottom: 1.5rem;
            }
            form {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              margin-bottom: 2rem;
            }
            input[type="text"] {
              flex: 1;
              padding: 0.6rem 0.8rem;
              font-size: 1rem;
              border: 2px solid #2e8b57;
              border-radius: 6px;
            }
            button {
              padding: 0.6rem 1.2rem;
              font-size: 1rem;
              background-color: #3cb371;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            }
            ul {
              list-style: none;
              padding: 0;
              text-align: left;
            }
            li {
              background: #f8f9fa;
              border-left: 4px solid #3cb371;
              padding: 0.8rem 1rem;
              margin-bottom: 0.6rem;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Todo App</h1>
          <img src="/image" alt="Random cached picture" />
          <form onsubmit="event.preventDefault();">
            <input type="text" maxlength="140" placeholder="Enter a new todo (max 140 characters)" />
            <button type="submit">Send</button>
          </form>
          <h2>Todos</h2>
          <ul>
            <li>Learn Kubernetes basics</li>
            <li>Deploy application to cluster</li>
            <li>Configure persistent volumes</li>
          </ul>
        </body>
      </html>
    `);
  } else if (req.method === 'GET' && req.url === '/image') {
    if (fs.existsSync(imagePath)) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(imagePath).pipe(res);
    } else {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Image is being downloaded, please refresh\n');
    }
  } else if (req.method === 'GET' && req.url === '/crash') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Shutting down container...\n');
    setTimeout(() => process.exit(1), 100);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => console.log(`Server started in port ${PORT}`));
