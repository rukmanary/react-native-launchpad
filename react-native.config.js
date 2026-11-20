const config = require('./starter.config.json');
const { groups } = require('./config/dependencies.json');
const installed = require('./package.json').dependencies;
const active = new Set(['core', ...config.modules]);
const enabled = new Set(
  Object.entries(groups)
    .filter(([name]) => active.has(name))
    .flatMap(([, packages]) => packages),
);
const dependencies = Object.fromEntries(
  Object.values(groups)
    .flat()
    .filter((name) => installed[name] && !enabled.has(name))
    .map((name) => [name, { platforms: { android: null, ios: null } }]),
);
// starter:module graphics
if (installed['@react-native-community/blur'])
  dependencies['@react-native-community/blur'] = {
    platforms: { android: null, ...(active.has('graphics') ? {} : { ios: null }) },
  };
// starter:end-module
// starter:module notifications
// PackageList(Application) has no legacy reactNativeHost on modern RN.
if (installed['react-native-notifications'] && active.has('notifications'))
  dependencies['react-native-notifications'] = {
    platforms: {
      android: {
        packageInstance: 'new RNNotificationsPackage(getApplication())',
      },
    },
  };
// starter:end-module
module.exports = { dependencies };
