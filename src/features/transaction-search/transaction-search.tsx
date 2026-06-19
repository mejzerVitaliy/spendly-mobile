import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

interface TransactionSearchProps {
  onSearchChange: (search: string) => void;
}

export function TransactionSearch({ onSearchChange }: TransactionSearchProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const borderOpacity = useSharedValue(0);
  const { t } = useTranslation();

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, borderOpacity]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(34,211,238,${borderOpacity.value * 0.6})`,
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

  const inputContent = (
    <>
      <Ionicons name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
        </Pressable>
      )}
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <Animated.View style={[styles.container, borderStyle]}>
        <BlurView intensity={30} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 16 }]} />
        {inputContent}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, borderStyle, { backgroundColor: colors.input }]}
    >
      {inputContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
  },
});
