const { withPodfile } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const TAG = 'withFirebaseModularHeaders';
// Firebase's Swift pods (FirebaseCrashlytics, FirebaseCoreInternal, ...) depend
// on Google's Objective-C pods, which don't define Swift module maps by
// default. With SPM disabled (see app.json's disableSPM) and no
// use_frameworks!, CocoaPods needs use_modular_headers! or `pod install`
// fails with "cannot yet be integrated as static libraries".
const FLAG = 'use_modular_headers!';
const ANCHOR = /^platform :ios/m;

function setModularHeaders(src) {
  return mergeContents({
    src,
    newSrc: FLAG,
    tag: TAG,
    anchor: ANCHOR,
    offset: 1,
    comment: '#',
  }).contents;
}

module.exports = function withFirebaseModularHeaders(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = setModularHeaders(config.modResults.contents);
    return config;
  });
};
