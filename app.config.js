const baseConfig = require('./app.json').expo;

// Firebase Crashlytics needs native code compiled in, which means every
// local `expo run:ios`/`run:android` has to fight CocoaPods/Xcode for it -
// not worth the friction for local dev, where you're already staring at
// crashes live in the terminal. Only EAS's `production` build profile
// (cloud build, consistent toolchain, what actually ships) links it in.
const ENABLE_FIREBASE = process.env.EAS_BUILD_PROFILE === 'production';

module.exports = {
  expo: {
    ...baseConfig,
    ios: {
      ...baseConfig.ios,
      ...(ENABLE_FIREBASE ? { googleServicesFile: './GoogleService-Info.plist' } : {}),
    },
    android: {
      ...baseConfig.android,
      ...(ENABLE_FIREBASE ? { googleServicesFile: './google-services.json' } : {}),
    },
    plugins: ENABLE_FIREBASE
      ? [
          ...baseConfig.plugins,
          ['@react-native-firebase/app', { ios: { disableSPM: true } }],
          '@react-native-firebase/crashlytics',
          './plugins/withFirebaseModularHeaders.js',
        ]
      : baseConfig.plugins,
    extra: {
      ...baseConfig.extra,
      enableCrashReporting: ENABLE_FIREBASE,
    },
  },
};
