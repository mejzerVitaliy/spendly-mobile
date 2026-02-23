import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface TransactionSearchProps {
  onSearchChange: (search: string) => void;
}

export function TransactionSearch({ onSearchChange }: TransactionSearchProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const borderOpacity = useSharedValue(0);

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, borderOpacity]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(59, 130, 246, ${borderOpacity.value})`,
  }));

  const handleChange = (text: string) => {
    setValue(text);
    onSearchChange(text);
  };

  const handleClear = () => {
    setValue('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      className="flex-row items-center bg-input rounded-2xl border mb-4 px-3"
      style={[{ borderColor: '#1F2937', height: 48 }, borderStyle]}
    >
      <Ionicons name="search" size={16} color="#6B7280" style={{ marginRight: 8 }} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search transactions..."
        placeholderTextColor="#6B7280"
        className="flex-1 text-sm text-foreground"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color="#6B7280" />
        </Pressable>
      )}
    </Animated.View>
  );
}
