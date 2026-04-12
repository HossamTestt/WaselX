// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly add missing extensions without destroying Expo's default .web.js extensions
config.resolver.sourceExts.push('cjs', 'mjs');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: require('path').resolve(__dirname, 'src/components/MapMock.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
