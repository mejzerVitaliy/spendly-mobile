import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NumericKeyboardProps {
  visible: boolean;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
}

const NUMBER_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

function KeyboardContent({
  onKeyPress,
  onDelete,
}: Pick<NumericKeyboardProps, 'onKeyPress' | 'onDelete'>) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = Dimensions.get('window').height * 0.35 + insets.bottom;
  const translateY = useSharedValue(keyboardHeight);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 250 });
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      className="absolute left-0 right-0 bg-slate-900 border-t border-slate-800 pt-2 px-2"
      style={[
        {
          bottom: 0,
          height: keyboardHeight,
          paddingBottom: insets.bottom,
        },
        animatedStyle,
      ]}
    >
      {NUMBER_ROWS.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-1 flex-row gap-1.5 mb-1.5">
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => onKeyPress(key)}
              className="flex-1 items-center justify-center rounded-xl bg-muted active:opacity-60"
            >
              <Text className="text-foreground text-2xl font-medium">{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}

      <View className="flex-1 flex-row gap-1.5">
        <Pressable
          onPress={() => onKeyPress('.')}
          className="flex-1 items-center justify-center rounded-xl bg-muted active:opacity-60"
        >
          <Text className="text-foreground text-2xl font-medium">.</Text>
        </Pressable>

        <Pressable
          onPress={() => onKeyPress('0')}
          className="flex-1 items-center justify-center rounded-xl bg-muted active:opacity-60"
        >
          <Text className="text-foreground text-2xl font-medium">0</Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          className="flex-1 items-center justify-center rounded-xl bg-muted active:opacity-60"
        >
          <Ionicons name="backspace-outline" size={24} color="#9CA3AF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function NumericKeyboard({ visible, onKeyPress, onDelete, onConfirm }: NumericKeyboardProps) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable className="flex-1" onPress={onConfirm} />
      <KeyboardContent
        onKeyPress={onKeyPress}
        onDelete={onDelete}
      />
    </Modal>
  );
}
