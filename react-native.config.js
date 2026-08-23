// Removing @react-native-firebase/* from app.config.js's plugins array
// (see the ENABLE_FIREBASE gate there) only skips their Expo config plugin
// mods - CocoaPods/Gradle autolinking still finds and links their podspecs
// from node_modules regardless of the plugins array, which is what broke
// local builds. This is what actually excludes them from local
// dev-client builds; only EAS's `production` profile links them in.
const ENABLE_FIREBASE = process.env.EAS_BUILD_PROFILE === 'production';

module.exports = {
  dependencies: ENABLE_FIREBASE
    ? {}
    : {
        '@react-native-firebase/app': {
          platforms: { ios: null, android: null },
        },
        '@react-native-firebase/crashlytics': {
          platforms: { ios: null, android: null },
        },
      },
};
