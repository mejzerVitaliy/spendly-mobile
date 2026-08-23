import { StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import { LogoRevealAnimation } from './logo-reveal-animation';

// The native splash (app.json's expo-splash-screen config) is just a solid
// black rect - all the actual artwork lives here, in JS, so it can be
// animated. Native splash screens can only show a single static image with
// a basic fade, no multi-stage sequencing.
const CARD_SIZE = 220;
// A brief pause once the bars settle, so the finished logo actually
// registers before handing off to the app instead of vanishing instantly.
const HOLD_AFTER = 350;

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <LogoRevealAnimation size={CARD_SIZE} onSettled={() => setTimeout(onFinish, HOLD_AFTER)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
