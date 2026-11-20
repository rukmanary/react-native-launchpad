export const states = {
  redux: 'Redux Toolkit + React Redux (default)',
  zustand: 'Zustand',
  mobx: 'MobX',
  recoil: 'Recoil (archived upstream; patched for React 19)',
};

export const apis = {
  rest: 'REST via fetch and TanStack Query (default)',
  graphql: 'GraphQL via Apollo Client',
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
