import { useEffect } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

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
const CARD_DURATION = 550;
const BARS_DELAY = 400;
const BARS_DURATION = 650;

interface LogoRevealAnimationProps {
  size?: number;
  // Fires once, exactly when the reveal finishes (bars settled) - no hold,
  // no auto-dismiss. What happens after is entirely up to the caller: the
  // boot splash holds briefly then reveals the app, a loading overlay just
  // leaves the finished logo on screen until the caller stops rendering it.
  onSettled?: () => void;
}

export function LogoRevealAnimation({ size = 220, onSettled }: LogoRevealAnimationProps) {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(size * 0.145);
  const barsScale = useSharedValue(0);

  // Where the bars meet the top of the card in the shared 1280 coordinate
  // space (see the bar paths in splash-bars-layer.svg - they're all drawn
  // down to y=524) - the scale anchor is this line, converted to display px.
  const barsAnchorY = (524 / 1280) * size;

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    cardTranslateY.value = withTiming(0, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) });
    barsScale.value = withDelay(
      BARS_DELAY,
      withTiming(1, { duration: BARS_DURATION, easing: Easing.out(Easing.back(1.15)) }, (finished) => {
        if (finished && onSettled) {
          runOnJS(onSettled)();
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
  // that pivot to barsAnchorY instead, so growth reads as "coming up out of
  // the card" rather than expanding from the middle of the canvas.
  const barsTranslateY = useDerivedValue(
    () => (barsAnchorY - size / 2) * (1 - barsScale.value),
  );

  const barsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: barsTranslateY.value }, { scaleY: barsScale.value }],
  }));

  return (
    <Animated.View style={{ width: size, height: size }}>
      <Animated.Image
        source={require('../../../../assets/images/splash-card.png')}
        style={[{ width: size, height: size }, cardStyle]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('../../../../assets/images/splash-bars.png')}
        style={[
          { position: 'absolute', top: 0, left: 0, width: size, height: size },
          barsStyle,
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
