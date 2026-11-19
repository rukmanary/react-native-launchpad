import { stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const artifact = process.argv[2];
if (!artifact) throw new Error('Usage: pnpm size:check path/to/app.apk [--record]');
const limits = JSON.parse(await readFile(new URL('../config/size-budget.json', import.meta.url)));
const bytes = (await stat(artifact)).size;
const name = path.basename(artifact);
const previous = limits.artifacts[name];
console.log(
  JSON.stringify({
    artifact: name,
    bytes,
    megabytes: bytes / 1024 / 1024,
    previous,
    delta: previous ? bytes - previous : null,
  }),
);
if (process.argv.includes('--record')) {
  limits.artifacts[name] = bytes;
  await writeFile(
    new URL('../config/size-budget.json', import.meta.url),
    JSON.stringify(limits, null, 2) + '\n',
  );
} else if (previous && bytes > previous * (1 + limits.maxGrowthPercent / 100))
  throw new Error('Artifact exceeded the recorded size budget');
else if (!previous)
  console.log(
    'No baseline: use --record after reviewing this release artifact. AAB size is not device download size.',
  );
