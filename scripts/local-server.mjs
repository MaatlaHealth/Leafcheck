// Local stand in for Netlify: serves dist/ and runs netlify/functions/api.mjs against a local
// Netlify Blobs server, so the full sync loop can be tested without a Netlify account.
// Run: npm run build && npm run serve:local   (then open http://localhost:8888)
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { BlobsServer } from '@netlify/blobs/server';

const APP_PORT = Number(process.env.PORT || 8888);
const DIST_DIRECTORY = 'dist';
const BLOBS_DIRECTORY = '.netlify/local-blobs';
const BLOBS_TOKEN = 'local-test-token';
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.bin': 'application/octet-stream',
  '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
};

await mkdir(BLOBS_DIRECTORY, { recursive: true });
const blobsServer = new BlobsServer({ directory: BLOBS_DIRECTORY, token: BLOBS_TOKEN });
const { port: blobsPort } = await blobsServer.start();
const blobsUrl = `http://localhost:${blobsPort}`;
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({
  siteID: 'local-site', token: BLOBS_TOKEN, edgeURL: blobsUrl, uncachedEdgeURL: blobsUrl,
})).toString('base64');

const { default: handleApiRequest } = await import('../netlify/functions/api.mjs');

async function serveStatic(pathname, response) {
  let filePath = normalize(join(DIST_DIRECTORY, decodeURIComponent(pathname)));
  if (!filePath.startsWith(normalize(DIST_DIRECTORY))) filePath = join(DIST_DIRECTORY, 'index.html');
  try {
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    // Same rule as netlify.toml: /officer is a route in the single page app. Anything else is a 404.
    if (pathname === '/officer' || pathname.startsWith('/officer/')) filePath = join(DIST_DIRECTORY, 'index.html');
    else {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('Not found');
      return;
    }
  }
  const fileContents = await readFile(filePath);
  response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filePath)] || 'application/octet-stream' });
  response.end(fileContents);
}

createServer(async (incoming, response) => {
  const requestUrl = new URL(incoming.url, `http://localhost:${APP_PORT}`);
  if (requestUrl.pathname.startsWith('/api/')) {
    const bodyChunks = [];
    for await (const chunk of incoming) bodyChunks.push(chunk);
    const request = new Request(requestUrl, {
      method: incoming.method,
      headers: incoming.headers,
      body: ['GET', 'HEAD'].includes(incoming.method) ? undefined : Buffer.concat(bodyChunks),
    });
    const apiResponse = await handleApiRequest(request);
    response.writeHead(apiResponse.status, Object.fromEntries(apiResponse.headers));
    response.end(Buffer.from(await apiResponse.arrayBuffer()));
    return;
  }
  await serveStatic(requestUrl.pathname, response);
}).listen(APP_PORT, () => {
  console.log(`Leihlo local server on http://localhost:${APP_PORT} (officer page: /officer)`);
  console.log(`Local Netlify Blobs data in ${BLOBS_DIRECTORY}`);
  if (process.env.LEIHLO_OFFICER_KEY) console.log('Officer access code is required for /api/reports and /api/decisions.');
});
