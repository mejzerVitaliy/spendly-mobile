import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface NumericKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

export function NumericKeyboard({ onKeyPress, onDelete }: NumericKeyboardProps) {
  return (
    <View
      style={{
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
      }}
    >
      {KEYS.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((key) => {
            const isDel = key === 'del';
            return (
              <Pressable
                key={key}
                onPress={() => (isDel ? onDelete() : onKeyPress(key))}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 52,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDel
                    ? pressed ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.12)'
                    : pressed ? '#374151' : '#1F2937',
                  borderWidth: 1,
                  borderColor: isDel ? 'rgba(139,92,246,0.3)' : '#374151',
                })}
              >
                {isDel ? (
                  <Ionicons name="backspace-outline" size={22} color="#8B5CF6" />
                ) : (
                  <Text
                    style={{
                      color: '#F9FAFB',
                      fontSize: 20,
                      fontWeight: '600',
                    }}
                  >
                    {key}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
