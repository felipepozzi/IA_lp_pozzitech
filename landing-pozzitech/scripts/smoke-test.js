'use strict';

// Smoke test: sobe o server numa porta efêmera e valida as rotas críticas.
// Uso: node scripts/smoke-test.js

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.SMOKE_PORT || 9998;
const BASE = `http://localhost:${PORT}`;

const checks = [
  { path: '/', expect: 200 },
  { path: '/privacidade', expect: 200 },
  { path: '/termos', expect: 200 },
  { path: '/sitemap.xml', expect: 200 },
  { path: '/rota-que-nao-existe-xyz', expect: 404 },
  { path: '/api/chat/init?sessionId=smoketest-' + Date.now(), expect: 200 },
];

function waitForServer(timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(BASE + '/')
        .then(() => resolve())
        .catch((err) => {
          if (Date.now() - start > timeoutMs) return reject(err);
          setTimeout(tryOnce, 300);
        });
    };
    tryOnce();
  });
}

async function runChecks() {
  let failures = 0;
  for (const check of checks) {
    try {
      const res = await fetch(BASE + check.path);
      const ok = res.status === check.expect;
      console.log(`${ok ? '✓' : '✗'} ${check.path} -> ${res.status} (esperado ${check.expect})`);
      if (!ok) failures++;
    } catch (err) {
      console.log(`✗ ${check.path} -> erro: ${err.message}`);
      failures++;
    }
  }
  return failures;
}

async function main() {
  const proc = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  proc.stdout.on('data', (d) => (serverOutput += d.toString()));
  proc.stderr.on('data', (d) => (serverOutput += d.toString()));

  let failures = 1;
  try {
    await waitForServer(8000);
    failures = await runChecks();
  } catch (err) {
    console.log(`✗ Server não subiu a tempo: ${err.message}`);
    console.log(serverOutput);
  } finally {
    proc.kill();
  }

  if (failures > 0) {
    console.log(`\n${failures} verificação(ões) falharam.`);
    process.exit(1);
  }
  console.log('\nTudo certo — smoke test passou.');
}

main();
