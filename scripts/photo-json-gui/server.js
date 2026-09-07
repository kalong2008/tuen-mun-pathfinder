#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { generatePhotoJson, resolveYear } = require('../generate-photo-json.js');

const execFileAsync = promisify(execFile);
const HOST = '127.0.0.1';
const PORT = 3456;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function countImages(folderPath) {
  return fs.readdirSync(folderPath).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext) && !file.includes('.json');
  }).length;
}

function inspectFolder(photoFolderPath) {
  const resolved = path.resolve(photoFolderPath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`Photo folder does not exist: ${resolved}`);
  }

  const folderName = path.basename(resolved);
  let year = null;
  try {
    year = resolveYear(resolved);
  } catch {
    year = null;
  }

  return {
    path: resolved,
    folderName,
    year,
    imageCount: countImages(resolved),
  };
}

async function pickFolder() {
  const { stdout } = await execFileAsync('osascript', [
    '-e',
    'POSIX path of (choose folder with prompt "Select photo folder")',
  ]);
  const chosen = stdout.trim().replace(/\/$/, '');
  if (!chosen) {
    throw new Error('No folder selected');
  }
  return inspectFolder(chosen);
}

async function handleGenerate(body) {
  const folderPath = typeof body.path === 'string' ? body.path.trim() : '';
  if (!folderPath) {
    throw new Error('Folder path is required');
  }

  const year = typeof body.year === 'string' && body.year.trim() ? body.year.trim() : undefined;
  const photos = await generatePhotoJson(folderPath, { year, quiet: true });
  const folderName = path.basename(path.resolve(folderPath));
  const jsonPath = path.join(path.resolve(folderPath), `${folderName}.json`);

  return {
    jsonPath,
    count: photos.length,
    sampleUrls: photos.slice(0, 5).map((photo) => photo.url),
  };
}

function serveIndex(res) {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      serveIndex(res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/pick-folder') {
      try {
        sendJson(res, 200, await pickFolder());
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const cancelled = /user canceled|user cancelled/i.test(message);
        sendJson(res, cancelled ? 409 : 400, { error: cancelled ? 'Folder picker was cancelled' : message });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/inspect') {
      const body = await readBody(req);
      sendJson(res, 200, inspectFolder(body.path || ''));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/generate') {
      const body = await readBody(req);
      sendJson(res, 200, await handleGenerate(body));
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 400, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`Photo JSON GUI: ${url}`);
  console.log('Stop with Ctrl+C');
  execFile('open', [url], (error) => {
    if (error) {
      console.log(`Open ${url} in your browser`);
    }
  });
});
