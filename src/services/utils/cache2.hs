const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const stream = require('stream');

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

async function cacheAndReturn(url, options = {}) {
  const cacheFile = md5(url + JSON.stringify(options.body)) + '.txt';
  const cachePath = path.join(__dirname, '/cache', cacheFile);

  if (fs.existsSync(cachePath)) {
    const cachedResponse = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    let body;
    if (cachedResponse.contentType === 'application/json') {
      body = JSON.parse(cachedResponse.body);
    } else {
      body = fs.createReadStream(cachePath);
    }
    return new fetch.Response(body, cachedResponse);
  } else {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let body;

    if (contentType === 'application/json') {
      body = await response.json();
      body = JSON.stringify(body);
    } else {
      body = await response.text();
    }

    const cachedResponse = {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers.raw(),
      size: response.size,
      timeout: response.timeout,
      body,
      contentType
    };

    fs.writeFileSync(cachePath, JSON.stringify(cachedResponse), 'utf8');
    return new fetch.Response(body, response);
  }
}

cacheAndReturn('http://example.com/your-url', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
  headers: { 'Content-Type': 'application/json' },
}).then((response) => {
  // handle the response
  if (response.headers.get('content-type') === 'application/json') {
    response.json().then(console.log);
  } else {
    response.text().then(console.log);
  }
});