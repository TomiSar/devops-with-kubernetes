const crypto = require('crypto');

const randomString = crypto.randomUUID();

const logRandomString = (timeInterval) => {
  const logString = () =>
    console.log(`${new Date().toISOString()}: ${randomString}`);
  logString();
  setInterval(logString, timeInterval);
};

logRandomString(5000);
