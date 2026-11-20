import { spawnSync } from 'node:child_process';

const apk = process.argv[2];
if (!apk) throw new Error('Usage: node scripts/check-native-alignment.mjs app.apk');

const list = spawnSync('unzip', ['-Z1', apk], { encoding: 'utf8' });
if (list.status !== 0) throw new Error('Cannot list APK');

const files = list.stdout
  .split('\n')
  .filter((name) => /^lib\/(arm64-v8a|x86_64)\/[^/]+\.so$/.test(name));
if (!files.length) throw new Error('No 64-bit native libraries found');

let failures = 0;
for (const file of files) {
  const result = spawnSync('unzip', ['-p', apk, file], { maxBuffer: 256 * 1024 * 1024 });
  if (result.status !== 0) throw new Error('Cannot read ' + file);
  const data = result.stdout;
  if (data.subarray(0, 4).toString('hex') !== '7f454c46' || data[4] !== 2 || data[5] !== 1)
    throw new Error('Unexpected ELF format: ' + file);
  const offset = Number(data.readBigUInt64LE(32)),
    size = data.readUInt16LE(54),
    count = data.readUInt16LE(56);
  const alignments = [];
  for (let i = 0; i < count; i++) {
    const at = offset + i * size;
    if (data.readUInt32LE(at) === 1) alignments.push(Number(data.readBigUInt64LE(at + 48)));
  }
  const valid = alignments.length > 0 && alignments.every((value) => value >= 16384);
  console.log((valid ? 'PASS ' : 'FAIL ') + file + ' ' + alignments.join(','));
  if (!valid) failures++;
}
console.log(
  JSON.stringify({
    libraries: files.length,
    failures,
    note: 'ELF inspection does not replace execution on a 16 KB device.',
  }),
);
process.exitCode = failures ? 1 : 0;
