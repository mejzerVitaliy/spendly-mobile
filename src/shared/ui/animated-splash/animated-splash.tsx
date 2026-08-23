import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
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
// Card and bars are two separate PNGs, both rendered from the exact same
// 1280x1280 source canvas (splash-card-layer.svg / splash-bars-layer.svg,
// neither cropped), so stacking them at identical size/position lines them
// up pixel-for-pixel with zero per-asset offset math.
//
// The bars reveal via scaleY anchored at their grounding line (where they
// meet the card), not a clip+translate wipe - clipping a soft glow mid-
// reveal cuts a hard edge straight through it, which looked like a bug.
// Scaling the whole (uncropped) image keeps the glow attached to the bars
// at every frame, so there's nothing to clip.
const CARD_SIZE = 220;
const CARD_SCALE = CARD_SIZE / 1280;
// Where the bars meet the top of the card in the shared 1280 coordinate
// space (see the bar paths in splash-bars-layer.svg - they're all drawn
// down to y=524) - the scale anchor is this line, converted to display px.
const BARS_ANCHOR_Y = 524 * CARD_SCALE;

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
  const barsScale = useSharedValue(0);

  // A brief pause once the bars settle, so the finished logo actually
  // registers before handing off to the app instead of vanishing instantly.
  const finishAfterHold = () => setTimeout(onFinish, HOLD_AFTER);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    cardTranslateY.value = withTiming(0, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    barsScale.value = withDelay(
      BARS_DELAY,
      withTiming(1, { duration: BARS_DURATION, easing: Easing.out(Easing.back(1.15)) }, (finished) => {
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

  // Scaling around the view's own center by default - translateY re-anchors
  // that pivot to BARS_ANCHOR_Y instead, so growth reads as "coming up out
  // of the card" rather than expanding from the middle of the canvas.
  const barsTranslateY = useDerivedValue(
    () => (BARS_ANCHOR_Y - CARD_SIZE / 2) * (1 - barsScale.value),
  );

  const barsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: barsTranslateY.value }, { scaleY: barsScale.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <View style={{ width: CARD_SIZE, height: CARD_SIZE }}>
        <Animated.Image
          source={require('../../../../assets/images/splash-card.png')}
          style={[{ width: CARD_SIZE, height: CARD_SIZE }, cardStyle]}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../../../../assets/images/splash-bars.png')}
          style={[
            { position: 'absolute', top: 0, left: 0, width: CARD_SIZE, height: CARD_SIZE },
            barsStyle,
          ]}
          resizeMode="contain"
        />
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
