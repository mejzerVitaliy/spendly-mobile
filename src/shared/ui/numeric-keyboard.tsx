import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme';

interface NumericKeyboardProps {
  visible: boolean;
  value?: string;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClose: () => void;
  /**
   * Called right before onClose when the user taps confirm - use it to
   * evaluate a running calculator expression (see evaluateNumericExpression
   * in numeric-input.ts) into the final amount before the keyboard closes.
   */
  onConfirm?: () => void;
  /**
   * Called after the close animation completes.
   * Use useNumericKeyboard().onClosed here — it blurs the input and
   * releases the guard that prevents onFocus from reopening the keyboard.
   */
  onClosed?: () => void;
}

// Grid (basic four-function calculator, left-to-right evaluation, no
// precedence - see evaluateNumericExpression):
// [7] [8] [9] [÷]
// [4] [5] [6] [×]
// [1] [2] [3] [−]
// [.] [0] [⌫] [+]
// [        ✓        ]
type KeyDef = { key: string; label: string; kind: 'digit' | 'operator' | 'delete' };

const GRID: readonly (readonly KeyDef[])[] = [
  [
    { key: '7', label: '7', kind: 'digit' },
    { key: '8', label: '8', kind: 'digit' },
    { key: '9', label: '9', kind: 'digit' },
    { key: '/', label: '÷', kind: 'operator' },
  ],
  [
    { key: '4', label: '4', kind: 'digit' },
    { key: '5', label: '5', kind: 'digit' },
    { key: '6', label: '6', kind: 'digit' },
    { key: '*', label: '×', kind: 'operator' },
  ],
  [
    { key: '1', label: '1', kind: 'digit' },
    { key: '2', label: '2', kind: 'digit' },
    { key: '3', label: '3', kind: 'digit' },
    { key: '-', label: '−', kind: 'operator' },
  ],
  [
    { key: '.', label: '.', kind: 'digit' },
    { key: '0', label: '0', kind: 'digit' },
    { key: '__delete__', label: '', kind: 'delete' },
    { key: '+', label: '+', kind: 'operator' },
  ],
];

export function NumericKeyboard({
  visible,
  value,
  onKeyPress,
  onDelete,
  onClose,
  onConfirm,
  onClosed,
}: NumericKeyboardProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const kbHeight = Math.max(320, screenHeight * 0.44) + (insets.bottom ?? 0);

  const kbHeightRef = useRef(kbHeight);
  kbHeightRef.current = kbHeight;

  const translateY = useSharedValue(kbHeight);
  const [modalVisible, setModalVisible] = useState(false);

  // Prevents the backdrop / ✓ button from firing onClose a second time
  // while the slide-down animation is already in progress.
  const closingRef = useRef(false);

  const afterClose = useCallback(() => {
    closingRef.current = false;
    setModalVisible(false);
    onClosed?.();
  }, [onClosed]);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      translateY.value = kbHeightRef.current;
      setModalVisible(true);
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Guard against the effect firing on initial mount (visible=false, modal not open)
      if (!modalVisible) return;
      closingRef.current = true;
      translateY.value = withTiming(
        kbHeightRef.current,
        { duration: 260, easing: Easing.in(Easing.cubic) },
        () => { runOnJS(afterClose)(); },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // onConfirm runs on every dismissal path (✓ button or backdrop tap), not
  // just the checkmark - an expression like "12+5" needs to be evaluated
  // into a final number regardless of how the user leaves the keyboard, or
  // the raw unevaluated string would leak out to whatever reads the value
  // next (e.g. parseFloat("12+5") silently truncates to 12).
  const handleClose = () => {
    if (!closingRef.current) {
      onConfirm?.();
      onClose();
    }
  };

  // Light haptic tap on every key so the keyboard feels more responsive -
  // it has no other tactile/visual feedback beyond the active: style.
  const pressKey = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKeyPress(key);
  }, [onKeyPress]);

  const pressDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
  }, [onDelete]);

  return (
    <Modal visible={modalVisible} transparent animationType="none" statusBarTranslucent>
      {/* Dimmed backdrop — tap to close */}
      <Pressable className="flex-1 bg-black/30" onPress={handleClose} />

      {/* Keyboard panel */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: kbHeight,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        {/* iOS blur layer */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={72}
            tint="systemUltraThinMaterialDark"
            className="absolute inset-0"
          />
        )}

        {/* Dark overlay (ios: semi-transparent, android: solid) */}
        <View
          className="absolute inset-0"
          style={{
            backgroundColor:
              Platform.OS === 'ios' ? 'rgba(8,8,8,0.62)' : '#0D0D0D',
          }}
        />

        {/* Top shine border */}
        <View className="h-px bg-white/10" />

        {/* Value display */}
        <View className="px-5 py-3 items-start">
          <Text className="text-[28px] font-bold text-foreground tracking-wide">
            {value || '0'}
          </Text>
        </View>

        {/* Separator */}
        <View className="mx-3 h-px bg-white/[0.06] mb-1.5" />

        {/* Keys — fill remaining height */}
        <View className="flex-1 px-3 gap-2">

          {GRID.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-1 flex-row gap-2">
              {row.map((k) => {
                if (k.kind === 'delete') {
                  return (
                    <Pressable
                      key={k.key}
                      onPress={pressDelete}
                      className="flex-1 items-center justify-center rounded-[16px] bg-white/[0.05] border border-white/[0.06] active:bg-white/[0.16] active:border-white/20"
                    >
                      <Ionicons name="backspace-outline" size={22} color="#F2F2F2" />
                    </Pressable>
                  );
                }
                const isOperator = k.kind === 'operator';
                return (
                  <Pressable
                    key={k.key}
                    onPress={() => pressKey(k.key)}
                    className={
                      isOperator
                        ? 'flex-1 items-center justify-center rounded-[16px] bg-white/[0.05] border border-white/[0.06] active:bg-white/[0.16] active:border-white/20'
                        : 'flex-1 items-center justify-center rounded-[16px] bg-white/[0.08] border border-white/[0.09] active:bg-white/20 active:border-white/25'
                    }
                  >
                    <Text
                      className="text-[22px] font-medium"
                      style={{ color: isOperator ? colors.primary : colors.foreground }}
                    >
                      {k.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Confirm ✓ - its own full-width row rather than a 5th column, so
              it stays a comfortably large tap target. */}
          <View className="flex-[0.7] flex-row">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center justify-center rounded-[16px] bg-primary active:opacity-70"
            >
              <Ionicons name="checkmark" size={24} color="#080808" />
            </Pressable>
          </View>
        </View>

        {/* Safe-area spacer */}
        <View style={{ height: Math.max(insets.bottom, 10) }} />
      </Animated.View>
    </Modal>
  );
}
