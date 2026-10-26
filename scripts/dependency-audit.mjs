import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const outputDir = resolve(
  process.env.CIVICMAPS_AUDIT_OUTPUT_DIR ?? 'test-results/dependency-audit',
);
await mkdir(outputDir, { recursive: true });

let failed = false;
for (const scope of ['production', 'all']) {
  const args = ['audit', '--json'];
  if (scope === 'production') args.push('--omit=dev');
  const result = spawnSync('npm', args, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120_000,
  });
  const reportPath = resolve(outputDir, `${scope}.json`);
  await writeFile(reportPath, result.stdout || result.stderr);

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error(`${scope} npm audit did not return valid JSON; report: ${reportPath}`);
    console.error(result.stderr.trim());
    failed = true;
    continue;
  }

  const vulnerabilities = Object.entries(report.vulnerabilities ?? {});
  const blocking = vulnerabilities.filter(([, item]) =>
    ['high', 'critical'].includes(item.severity),
  );
  const review = vulnerabilities.filter(([, item]) => ['moderate', 'low'].includes(item.severity));
  console.log(
    `${scope}: ${blocking.length} high/critical blocking; ${review.length} low/moderate for review; ${vulnerabilities.length - blocking.length - review.length} informational; report ${reportPath}`,
  );
  for (const [name, item] of review) {
    console.log(`  review ${name}: ${item.severity}; direct=${item.isDirect}; range=${item.range}`);
  }
  for (const [name, item] of blocking) {
    console.error(
      `  ${name}: ${item.severity}; direct=${item.isDirect}; range=${item.range}; paths=${item.nodes.join(', ')}`,
    );
  }
  if (
    result.error ||
    report.error ||
    (result.status !== 0 && vulnerabilities.length === 0) ||
    blocking.length
  )
    failed = true;
}

if (failed) process.exitCode = 1;
