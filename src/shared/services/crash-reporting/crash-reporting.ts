import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
  recordError,
} from '@react-native-firebase/crashlytics';

/**
 * Native crashes are captured automatically once the module is linked - no
 * code needed for those. This only adds JS-level error capture (things
 * that throw in JS but aren't a native crash) and gates collection to real
 * builds, same as local dev errors are already visible in the Metro
 * terminal and shouldn't be reported.
 */
const init = () => {
  const instance = getCrashlytics();
  setCrashlyticsCollectionEnabled(instance, !__DEV__);

  if (__DEV__) return;

  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    recordError(instance, error);
    previousHandler(error, isFatal);
  });
};

export const crashReporting = { init };
