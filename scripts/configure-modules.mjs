import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import flavors from '../config/flavors.json' with { type: 'json' };
import { selectModules } from './lib/starter-options.mjs';
export async function configureModules(root, selected, { writeConfig = true } = {}) {
  const configPath = path.join(root, 'starter.config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const catalog = JSON.parse(await readFile(path.join(root, 'config/dependencies.json'), 'utf8'));
  // Older Zustand projects included the preset in the capability list.
  const requested = selected.filter((name) => name !== 'zustand' || config.state !== 'zustand');
  const modules = selectModules(catalog, requested.join(',') || 'core');
  const installed = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8'),
  ).dependencies;
  const missing = modules
    .flatMap((name) => catalog.groups[name])
    .filter((name) => !installed[name]);
  if (missing.length) throw new Error('Install selected dependencies first: ' + missing.join(', '));
  if (writeConfig) {
    config.modules = modules;
    await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  }
  const has = (name) => modules.includes(name);
  const permissions = [
    'INTERNET',
    ...(has('camera') || has('media') ? ['CAMERA', 'RECORD_AUDIO'] : []),
    ...(has('location') ? ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'] : []),
    ...(has('notifications') || has('firebase') ? ['POST_NOTIFICATIONS'] : []),
  ];
  const manifest = path.join(root, 'android/app/src/main/AndroidManifest.xml');
  let xml = await readFile(manifest, 'utf8');
  xml = xml.replace(/\s*<!-- starter:permissions -->[\s\S]*?<!-- starter:end-permissions -->/, '');
  xml = xml.replace(/\s*<uses-permission android:name="android.permission.INTERNET" \/>/, '');
  xml = xml.replace(
    /(<manifest[^>]*>)/,
    '$1\n<!-- starter:permissions -->\n' +
      permissions
        .map((p) => '    <uses-permission android:name="android.permission.' + p + '" />')
        .join('\n') +
      '\n<!-- starter:end-permissions -->',
  );
  xml = xml.replace(/\s*<!-- starter:link -->[\s\S]*?<!-- starter:end-link -->/, '');
  xml = xml.replace(
    '</activity>',
    '<!-- starter:link --><intent-filter><action android:name="android.intent.action.VIEW"/><category android:name="android.intent.category.DEFAULT"/><category android:name="android.intent.category.BROWSABLE"/><data android:scheme="${starterScheme}"/></intent-filter><!-- starter:end-link -->\n      </activity>',
  );
  xml = xml.replace(/\s*<!-- starter:maps -->[\s\S]*?<!-- starter:end-maps -->/, '');
  if (has('location'))
    xml = xml.replace(
      '</application>',
      '<!-- starter:maps --><meta-data android:name="com.google.android.geo.API_KEY" android:value="${mapsApiKey}"/><!-- starter:end-maps --></application>',
    );
  await writeFile(manifest, xml);
  const plist = path.join(root, 'ios', config.name, 'Info.plist');
  let info = await readFile(plist, 'utf8');
  info = info.replace(/<key>NSLocationWhenInUseUsageDescription<\/key>\s*<string><\/string>/, '');
  info = info.replace(
    /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
    (_, opening, closing) => opening + '$(STARTER_APP_DISPLAY_NAME)' + closing,
  );
  info = info.replace(
    /\s*<!-- starter:permissions -->[\s\S]*?<!-- starter:end-permissions -->/,
    '',
  );
  const entries = {
    ...(has('camera') || has('media')
      ? {
          NSCameraUsageDescription: 'Take photos for the selected feature.',
          NSMicrophoneUsageDescription: 'Record audio with video.',
        }
      : {}),
    ...(has('media')
      ? {
          NSPhotoLibraryUsageDescription: 'Select a photo to share.',
          NSPhotoLibraryAddUsageDescription: 'Save images you choose.',
        }
      : {}),
    ...(has('location')
      ? { NSLocationWhenInUseUsageDescription: 'Show your location while using this feature.' }
      : {}),
    ...(has('biometrics')
      ? { NSFaceIDUsageDescription: 'Unlock using your enrolled biometrics.' }
      : {}),
  };
  const block =
    '<!-- starter:permissions -->\n' +
    Object.entries(entries)
      .map(([k, v]) => '<key>' + k + '</key><string>' + v + '</string>')
      .join('\n') +
    '\n<!-- starter:end-permissions -->\n';
  info = info.replace(/<\/dict>\s*<\/plist>/, block + '</dict>\n</plist>');
  await writeFile(plist, info);
  const init = [];
  if (has('firebase'))
    init.push(
      "if (config.services.firebase) { require('../modules/firebase/background').registerBackgroundMessaging(); }",
    );
  if (has('sentry'))
    init.push(
      "if (config.services.sentryDsn) { require('../modules/sentry/telemetry').initializeTelemetry(); }",
    );
  await mkdir(path.join(root, 'src/generated'), { recursive: true });
  const formatting = {
    ...(await resolveConfig(path.join(root, 'src/generated/bootstrap.ts'))),
    parser: 'typescript',
  };
  await writeFile(
    path.join(root, 'src/generated/bootstrap.ts'),
    await format(
      "import {config} from '../core/config/config';\nexport function initializeModules(){\n void config;\n" +
        init.join('\n') +
        '\n}\n',
      formatting,
    ),
  );
  const exports = modules
    .filter((name) => name !== 'core' && name !== 'zustand')
    .map((name) => 'export * as ' + name + " from '../modules/" + name + "';");
  await writeFile(
    path.join(root, 'src/generated/modules.ts'),
    await format(exports.join('\n') + '\n', formatting),
  );
  const source = path.join(root, 'android/app/src/main/java', ...config.androidId.split('.'));
  await access(source);
  const nativePackages =
    'package ' +
    config.androidId +
    '\nimport com.facebook.react.ReactPackage\nobject OptionalPackages { fun create(): List<ReactPackage> = ' +
    (has('graphics') ? 'listOf(' + config.androidId + '.blur.BlurPackage())' : 'emptyList()') +
    ' }\n';
  await writeFile(path.join(source, 'OptionalPackages.kt'), nativePackages);
  let generatedInfo = await readFile(plist, 'utf8');
  generatedInfo = generatedInfo.replace(
    /\s*<!-- starter:services -->[\s\S]*?<!-- starter:end-services -->/,
    '',
  );
  const schemes = ['$(STARTER_URL_SCHEME)', ...(has('google') ? ['$(STARTER_GOOGLE_SCHEME)'] : [])];
  const serviceBlock =
    '<!-- starter:services -->\n<key>CFBundleURLTypes</key><array><dict><key>CFBundleURLSchemes</key><array>' +
    schemes.map((s) => '<string>' + s + '</string>').join('') +
    '</array></dict></array>' +
    (has('location') ? '<key>GoogleMapsApiKey</key><string>$(STARTER_MAPS_KEY)</string>' : '') +
    (has('firebase')
      ? '<key>UIBackgroundModes</key><array><string>remote-notification</string></array>'
      : '') +
    '<!-- starter:end-services -->\n';
  generatedInfo = generatedInfo.replace(/<\/dict>\s*<\/plist>/, serviceBlock + '</dict>\n</plist>');
  await writeFile(plist, generatedInfo);
  const settingsDir = path.join(root, 'ios/Config');
  await mkdir(settingsDir, { recursive: true });
  for (const [name, flavor] of Object.entries(flavors)) {
    const services = name === 'production' ? config.services : config.flavorServices?.[name];
    const scheme = config.scheme + flavor.suffix;
    const googleScheme = services?.googleIosClientId?.split('.').reverse().join('.') || scheme;
    const xcconfig = {
      STARTER_FLAVOR: name,
      STARTER_APP_DISPLAY_NAME: config.displayName + flavor.label,
      STARTER_URL_SCHEME: scheme,
      STARTER_GOOGLE_SCHEME: googleScheme,
      STARTER_MAPS_KEY: services?.mapsIosKey ?? '',
      STARTER_FIREBASE_ENABLED: has('firebase') ? 'YES' : 'NO',
    };
    const settings = Object.entries(xcconfig).map(([key, value]) => {
      if (/[\r\n]/.test(value)) throw new Error('Invalid iOS build setting: ' + key);
      return `${key} = ${value.replaceAll('//', '/$(STARTER_SLASH)')}`.trimEnd();
    });
    await writeFile(
      path.join(settingsDir, name + '.xcconfig'),
      '// Generated by pnpm modules from starter.config.json.\nSTARTER_SLASH = /\n' +
        settings.join('\n') +
        '\n',
    );
  }
  return modules;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const selected = (process.argv[2] ?? 'core').split(',');
    console.log('Enabled modules:', (await configureModules(root, selected)).join(', '));
    console.log('Rebuild native apps; run pnpm ios:pods after changing modules.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
