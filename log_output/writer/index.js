const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const directory = '/usr/src/app/files';
const filePath = path.join(directory, 'output.txt');

fs.mkdirSync(directory, { recursive: true });

const randomString = crypto.randomUUID();

const writeStatus = () => {
  const line = `${new Date().toISOString()}: ${randomString}`;
  console.log(line);
  fs.writeFileSync(filePath, `${line}\n`);
};

writeStatus();
setInterval(writeStatus, 5000);
