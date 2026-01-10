const http = require('http');

const data = JSON.stringify({
  query: 'account',
  limit: 5
});

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/v1/rag/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let output = '';
  res.on('data', chunk => output += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Results:', output);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
