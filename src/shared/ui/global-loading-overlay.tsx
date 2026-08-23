import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { colors } from '@/shared/theme';
import { useGlobalLoadingStore } from '@/shared/stores';
import { LogoRevealAnimation } from './animated-splash';

/**
 * Full-screen version of the boot splash's logo animation, reused for any
 * operation that fans out into a cascade of requests the rest of the app
 * needs to sit out - e.g. changing main currency (invalidates user/wallets/
 * transactions/reports) or app language. Driven by useGlobalLoadingStore /
 * withGlobalLoading, not local state, so any screen can trigger it.
 *
 * The reveal animation plays once and then just holds on the finished
 * logo - if the operation is still pending after that, the overlay stays
 * up with a static (not looping) logo rather than replaying the animation,
 * per the "leave it open without the animation" requirement.
 */
export function GlobalLoadingOverlay() {
  const visible = useGlobalLoadingStore((s) => s.count > 0);

  if (!visible) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, styles.container]}
    >
      <LogoRevealAnimation size={170} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998,
  },
});
