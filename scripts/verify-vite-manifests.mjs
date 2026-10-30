import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'node_modules']);
const manifests = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excluded.has(entry.name)) await visit(path.join(directory, entry.name));
    } else if (entry.name === 'package.json') {
      manifests.push(path.join(directory, entry.name));
    }
  }
}

await visit(root);
const failures = [];
for (const manifest of manifests) {
  const pkg = JSON.parse(await readFile(manifest, 'utf8'));
  const declared = [
    pkg.dependencies?.vite,
    pkg.devDependencies?.vite,
    pkg.optionalDependencies?.vite,
  ].filter(Boolean);
  for (const version of declared) {
    if (version !== '6.4.5') {
      failures.push(`${path.relative(root, manifest)} declares vite ${version}; expected 6.4.5`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${manifests.length} package manifests: every direct Vite declaration is 6.4.5.`,
  );
}
