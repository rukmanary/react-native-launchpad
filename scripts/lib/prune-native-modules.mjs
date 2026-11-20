import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

const moduleBlock =
  /^[\t ]*(?:\/\/|#|\/\*) starter:module ([a-z,]+)(?: \*\/)?\r?\n([\s\S]*?)^[\t ]*(?:\/\/|#|\/\*) starter:end-module(?: \*\/)?(?:\r?\n|$)/gm;

export async function pruneNativeModules(root, appName, modules) {
  const files = [
    'android/build.gradle',
    'android/app/build.gradle',
    'babel.config.js',
    'ios/Podfile',
    `ios/${appName}.xcodeproj/project.pbxproj`,
    `ios/${appName}/AppDelegate.swift`,
    `ios/${appName}/SceneDelegate.swift`,
    'react-native.config.js',
    'scripts/doctor.mjs',
  ];
  for (const relative of files) {
    const file = path.join(root, relative);
    const contents = await readFile(file, 'utf8').catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    if (contents === undefined) continue;
    const selected = contents.replace(moduleBlock, (_, names, body) =>
      names.split(',').some((name) => modules.includes(name)) ? body : '',
    );
    if (selected === contents) continue;
    const formatted = /\.m?js$/.test(file)
      ? await format(selected, { ...(await resolveConfig(file)), filepath: file })
      : selected;
    await writeFile(file, formatted);
  }
}
