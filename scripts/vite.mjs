// ChromeOS removable files do not preserve executable permissions. Keep source
// on the USB drive; run only the pinned esbuild tool on the Linux filesystem.
import { copyFileSync, chmodSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tools = resolve(tmpdir(), `civicmaps-tools-${process.getuid?.() ?? 'local'}`);
mkdirSync(tools, { recursive: true, mode: 0o700 });
const esbuild = resolve(tools, 'esbuild');
copyFileSync(resolve(root, 'node_modules/@esbuild/linux-x64/bin/esbuild'), esbuild);
chmodSync(esbuild, 0o700);
const child = spawn(
  process.execPath,
  [resolve(root, 'node_modules/vite/bin/vite.js'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, ESBUILD_BINARY_PATH: esbuild },
  },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
