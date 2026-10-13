import { spawn } from 'node:child_process';
const apps = process.argv.includes('--platform') ? ['civicmaps-platform'] : ['commandmaps', 'civicmaps-platform'];
const children = [spawn(process.execPath, ['services/api/server.mjs'], { stdio: 'inherit' }), ...apps.map(app => spawn('npm', ['--prefix', `apps/${app}`, 'run', 'dev'], { stdio: 'inherit' }))];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 500).unref();
}
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => stop(code ?? 1));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
