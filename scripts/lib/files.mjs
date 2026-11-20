import { readdir, lstat, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

export const excluded = new Set([
  'node_modules',
  '.tools',
  'artifacts',
  '.bundle',
  '.pnpm-store',
  'sentry.properties',
  'key.properties',
  '.git',
  '.gradle',
  '.cxx',
  '.kotlin',
  '.idea',
  'xcuserdata',
  '.npmrc',
  '.netrc',
  'build',
  'Pods',
  'DerivedData',
  'coverage',
  '.DS_Store',
  'local.properties',
  'debug.keystore',
  'google-services.json',
  'GoogleService-Info.plist',
]);

export function isExcluded(name) {
  return (
    excluded.has(name) ||
    /^\.env/i.test(name) ||
    /\.env(\.|$)/i.test(name) ||
    /\.(keystore|jks|p12|pfx|mobileprovision|provisionprofile|pem|key|p8|apk|aab|apks|ipa|dSYM)$/i.test(
      name,
    )
  );
}

export const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.yaml',
  '.yml',
  '.md',
  '.xml',
  '.gradle',
  '.properties',
  '.kt',
  '.java',
  '.swift',
  '.plist',
  '.pbxproj',
  '.xcscheme',
  '.storyboard',
  '.xcprivacy',
  '.rb',
  '.pro',
  '.sh',
  '.bat',
  '.txt',
]);

export async function copyTree(source, target, { shouldCopy, transformPath, transformText }) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (isExcluded(entry.name)) continue;
    if (
      (entry.name === 'bundle' && path.basename(source) === 'vendor') ||
      (entry.name === 'tests' && path.basename(source) === '.maestro')
    )
      continue;
    const from = path.join(source, entry.name);
    if (!shouldCopy(from)) continue;
    const to = transformPath(path.join(target, entry.name));
    if ((await lstat(from)).isSymbolicLink())
      throw new Error('Refusing symbolic link: ' + entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to, { shouldCopy, transformPath, transformText });
    } else {
      await mkdir(path.dirname(to), { recursive: true });
      if (
        textExtensions.has(path.extname(entry.name)) ||
        [
          'Podfile',
          'Gemfile',
          'Fastfile',
          'Appfile',
          'gradlew',
          '.gitignore',
          '.watchmanconfig',
        ].includes(entry.name)
      ) {
        await writeFile(to, transformText(await readFile(from, 'utf8'), to), {
          mode: (await lstat(from)).mode,
        });
      } else await copyFile(from, to);
    }
  }
}
