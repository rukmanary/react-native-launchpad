const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withRozenite } = require('@rozenite/metro');
const { resolveAppAlias } = require('#project/config/module-aliases.js');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    resolveRequest: (context, name, platform) =>
      context.resolveRequest(context, resolveAppAlias(name) ?? name, platform),
  },
});

module.exports = withRozenite(config, { enabled: process.argv.includes('start') });
