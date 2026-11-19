import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const audit = JSON.parse(
  await readFile(new URL('../config/dependency-audit.json', import.meta.url)),
);
console.log('Registry snapshot: ' + audit.checkedAt);
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const latest = audit.records[name]?.version;
  if (latest && version !== latest)
    console.log(name + ': selected ' + version + '; observed latest ' + latest);
}
console.log(
  'Latest observations are not proof of native compatibility. See docs/compatibility.md.',
);
