import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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

interface NumericKeyboardProps {
  visible: boolean;
  value?: string;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClose: () => void;
  /**
   * Called after the close animation completes.
   * Use useNumericKeyboard().onClosed here — it blurs the input and
   * releases the guard that prevents onFocus from reopening the keyboard.
   */
  onClosed?: () => void;
}

// Grid:
// [1] [2] [3]
// [4] [5] [6]
// [7] [8] [9]
// [⌫] [0] [✓]
const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export function NumericKeyboard({
  visible,
  value,
  onKeyPress,
  onDelete,
  onClose,
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

  const handleClose = () => {
    if (!closingRef.current) {
      onClose();
    }
  };

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

          {/* Rows 1–9 */}
          {NUMBER_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-1 flex-row gap-2">
              {row.map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => onKeyPress(digit)}
                  className="flex-1 items-center justify-center rounded-[16px] bg-white/[0.08] border border-white/[0.09] active:bg-white/20 active:border-white/25"
                >
                  <Text className="text-[22px] font-medium text-foreground">
                    {digit}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Bottom row: ⌫ · 0 · ✓ */}
          <View className="flex-1 flex-row gap-2">

            {/* Backspace */}
            <Pressable
              onPress={onDelete}
              className="flex-1 items-center justify-center rounded-[16px] bg-white/[0.05] border border-white/[0.06] active:bg-white/[0.16] active:border-white/20"
            >
              <Ionicons name="backspace-outline" size={22} color="#F2F2F2" />
            </Pressable>

            {/* 0 */}
            <Pressable
              onPress={() => onKeyPress('0')}
              className="flex-1 items-center justify-center rounded-[16px] bg-white/[0.08] border border-white/[0.09] active:bg-white/20 active:border-white/25"
            >
              <Text className="text-[22px] font-medium text-foreground">0</Text>
            </Pressable>

            {/* Confirm ✓ */}
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center justify-center rounded-[16px] bg-primary active:opacity-70"
            >
              <Ionicons name="checkmark" size={26} color="#080808" />
            </Pressable>
          </View>
        </View>

        {/* Safe-area spacer */}
        <View style={{ height: Math.max(insets.bottom, 10) }} />
      </Animated.View>
    </Modal>
  );
}
