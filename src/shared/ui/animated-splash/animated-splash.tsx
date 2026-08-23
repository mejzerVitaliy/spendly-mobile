import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/shared/theme';

// The native splash (app.json's expo-splash-screen config) is just a solid
// black rect - all the actual artwork lives here, in JS, so it can be
// animated. Native splash screens can only show a single static image with
// a basic fade, no multi-stage sequencing.
//
// Card and bars are two separate PNGs (not the combined splash-icon.png)
// rendered from the same 1280x1280 source coordinate space, so they line up
// exactly at any shared scale - see assets/brand/splash-card-layer.svg and
// splash-bars-crop.svg for how they were derived.
const CARD_SIZE = 220;
const CARD_SCALE = CARD_SIZE / 1280;
// splash-bars-crop.svg's viewBox is "300 260 640 264" in that same 1280
// space - these are that box's origin/size converted to CARD_SCALE, i.e.
// exactly where the bars sit relative to the card's top-left corner.
const BARS_WIDTH = 640 * CARD_SCALE;
const BARS_HEIGHT = 264 * CARD_SCALE;
const BARS_LEFT = 300 * CARD_SCALE;
const BARS_TOP = 260 * CARD_SCALE;

const CARD_DURATION = 550;
const BARS_DELAY = 400;
const BARS_DURATION = 650;
const HOLD_AFTER = 350;

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(32);
  const barsTranslateY = useSharedValue(BARS_HEIGHT);

  // A brief pause once the bars settle, so the finished logo actually
  // registers before handing off to the app instead of vanishing instantly.
  const finishAfterHold = () => setTimeout(onFinish, HOLD_AFTER);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    cardTranslateY.value = withTiming(0, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    barsTranslateY.value = withDelay(
      BARS_DELAY,
      withTiming(0, { duration: BARS_DURATION, easing: Easing.out(Easing.back(1.2)) }, (finished) => {
        if (finished) {
          runOnJS(finishAfterHold)();
        }
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const barsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: barsTranslateY.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <View style={{ width: CARD_SIZE, height: CARD_SIZE }}>
        <Animated.Image
          source={require('../../../../assets/images/splash-card.png')}
          style={[{ width: CARD_SIZE, height: CARD_SIZE }, cardStyle]}
          resizeMode="contain"
        />
        <View
          style={{
            position: 'absolute',
            left: BARS_LEFT,
            top: BARS_TOP,
            width: BARS_WIDTH,
            height: BARS_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <Animated.Image
            source={require('../../../../assets/images/splash-bars.png')}
            style={[{ width: BARS_WIDTH, height: BARS_HEIGHT }, barsStyle]}
            resizeMode="stretch"
          />
        </View>
      </View>
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
