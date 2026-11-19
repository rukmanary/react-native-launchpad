const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withRozenite } = require('@rozenite/metro');
const config = mergeConfig(getDefaultConfig(__dirname), {});
module.exports = withRozenite(config, { enabled: process.argv.includes('start') });
