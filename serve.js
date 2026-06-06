const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const START_PORT = Number(process.env.PORT) || 8080;
const MAX_PORT = START_PORT + 10;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

function loadSupabaseConfig() {
  const fromEnv = {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
  };
  if (fromEnv.url && fromEnv.key) return fromEnv;

  const localPath = path.join(ROOT, 'supabase.local.json');
  try {
    const raw = fs.readFileSync(localPath, 'utf8');
    const data = JSON.parse(raw);
    if (data.url && data.key) return { url: data.url, key: data.key };
  } catch {
    /* optional local file */
  }

  return fromEnv;
}

const supabaseConfig = loadSupabaseConfig();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/api/config') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(supabaseConfig));
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-store' : 'public, max-age=3600',
    });
    res.end(data);
  });
});

function openBrowser(port) {
  if (process.env.OPEN_BROWSER === '0') return;
  const url = `http://127.0.0.1:${port}/`;
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`, { windowsHide: true });
  }
}

function onReady(port) {
  console.log('');
  console.log('  Worldroot is running!');
  console.log(`  Site:  http://localhost:${port}`);
  console.log(`  Game:  http://localhost:${port}/game.html`);
  console.log(`  Folder: ${ROOT}`);
  if (supabaseConfig.url) {
    console.log('  Cloud saves: Supabase configured');
  } else {
    console.log('  Cloud saves: not configured (offline mode still works)');
  }
  console.log('  Keep this window open. Press Ctrl+C to stop.');
  console.log('');
  openBrowser(port);
}

function tryListen(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < MAX_PORT) {
      tryListen(port + 1);
      return;
    }
    console.error('  Server error:', err.message);
    process.exit(1);
  });
  server.listen(port, HOST, () => onReady(port));
}

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('  index.html not found. Run this from the idle-game folder.');
  process.exit(1);
}

tryListen(START_PORT);
