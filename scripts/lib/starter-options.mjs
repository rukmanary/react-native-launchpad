export const states = {
  redux: 'Redux Toolkit + React Redux (default)',
  zustand: 'Zustand',
};

const descriptions = {
  core: 'Navigation, forms, server cache, storage, permissions, and layout',
  graphics: 'Skia, charts, SVG, gradients, and blur',
  offline: 'WatermelonDB and sync adapters',
  biometrics: 'Biometric unlock and challenge signing',
  camera: 'VisionCamera',
  media: 'Image and document pickers, cropping, audio, video, files, and sharing',
  location: 'Location and maps',
  notifications: 'Local notifications and push integration',
  firebase:
    'Firebase Auth, FCM, Analytics, Crashlytics, Remote Config, Performance, and Realtime Database',
  content: 'WebView and HTML rendering',
  ui: 'Bottom sheet, dates, calendar, OTP, carousel, pager, and tours',
  chat: 'GiftedChat',
  google: 'Google Sign-In',
  sentry: 'Sentry',
};

export function describeModules(catalog, dependencies) {
  return Object.entries(catalog.groups)
    .filter(([name]) => name !== 'zustand')
    .map(([name, packages]) => {
      const present =
        name === 'core' || packages.every((dependency) => Object.hasOwn(dependencies, dependency));
      return `${name.padEnd(14)} ${descriptions[name] ?? packages.join(', ')}${present ? '' : ' [not included in this project]'}`;
    })
    .join('\n');
}

export function selectModules(catalog, selection, state) {
  if (!Object.hasOwn(states, state)) throw new Error('Choose --state redux or --state zustand.');
  const names = selection.split(',').map((name) => name.trim());
  if (names.length === 1 && names[0] === 'all') {
    names.splice(0, 1, ...Object.keys(catalog.groups).filter((name) => name !== 'zustand'));
  }
  for (const name of names) {
    if (name === 'zustand') throw new Error('Use --state zustand to select Zustand.');
    if (!Object.hasOwn(catalog.groups, name))
      throw new Error(`Unknown module "${name}". Run pnpm list:modules to see available modules.`);
  }
  return [...new Set(['core', ...names, ...(state === 'zustand' ? ['zustand'] : [])])];
}
