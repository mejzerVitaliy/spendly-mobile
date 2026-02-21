import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function NumericKeyboard({ visible, onKeyPress, onDelete, onConfirm }: NumericKeyboardProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = SCREEN_HEIGHT * 0.3 + insets.bottom;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={onConfirm}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        <View
          className="bg-[#0F172A] border-t border-[#1E293B]"
          style={{ height: keyboardHeight, paddingBottom: insets.bottom, padding: 8, gap: 6 }}
        >
          {NUMBER_ROWS.map((row, rowIdx) => (
            <View key={rowIdx} className="flex-1 flex-row" style={{ gap: 6 }}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => onKeyPress(key)}
                  className="flex-1 items-center justify-center rounded-xl bg-[#1E293B] active:bg-[#334155]"
                >
                  <Text className="text-white text-2xl font-medium">{key}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          <View className="flex-1 flex-row" style={{ gap: 6 }}>
            <Pressable
              onPress={onDelete}
              className="flex-1 items-center justify-center rounded-xl bg-[#1E293B] active:bg-[#334155]"
            >
              <Ionicons name="backspace-outline" size={24} color="#94A3B8" />
            </Pressable>

            <Pressable
              onPress={() => onKeyPress('0')}
              className="flex-1 items-center justify-center rounded-xl bg-[#1E293B] active:bg-[#334155]"
            >
              <Text className="text-white text-2xl font-medium">0</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-xl bg-violet-600 active:bg-violet-700"
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
