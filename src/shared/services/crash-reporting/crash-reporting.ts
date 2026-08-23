import Constants from 'expo-constants';

// Firebase is only linked into the native binary for EAS's `production`
// build profile (see app.config.js) - every other build (local dev, EAS
// preview/development) doesn't have the native module at all. The import
// itself (not just calling its functions) is what touches the native
// module, so it has to stay out of this file's static imports entirely -
// pulled in via require() only once we know it's safe to.
const ENABLED = Constants.expoConfig?.extra?.enableCrashReporting === true;

/**
 * Native crashes are captured automatically once the module is linked - no
 * code needed for those. This only adds JS-level error capture (things
 * that throw in JS but aren't a native crash) and gates collection to real
 * builds, same as local dev errors are already visible in the Metro
 * terminal and shouldn't be reported.
 */
const init = () => {
  if (!ENABLED) return;

  // Crash reporting must never be the thing that crashes the app - if the
  // native module isn't actually available for any reason, fail silently
  // rather than surfacing a red screen for something the user didn't do.
  try {
    // Must stay a conditionally-evaluated require(), not a static import (see comment above).
    const rnfbCrashlytics = require('@react-native-firebase/crashlytics') as // eslint-disable-line @typescript-eslint/no-require-imports
      typeof import('@react-native-firebase/crashlytics');
    const { getCrashlytics, setCrashlyticsCollectionEnabled, recordError } = rnfbCrashlytics;

    const instance = getCrashlytics();
    setCrashlyticsCollectionEnabled(instance, !__DEV__);

    if (__DEV__) return;

    const previousHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      recordError(instance, error);
      previousHandler(error, isFatal);
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[crash-reporting] init failed, continuing without it:', error);
    }
  }
};

export const crashReporting = { init };
