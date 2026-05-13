import { useRef, useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { NumericKeyboard } from './numeric-keyboard';
import { colors } from '@/shared/theme';

interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  helperText?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  helperText,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isNumericKeyboardVisible, setIsNumericKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isNumeric = type === 'number';
  const keyboardType = type === 'email' ? 'email-address' : 'default';
  const secureTextEntry = type === 'password' && !isPasswordVisible;

  const handleNumericKey = (key: string) => {
    const current = value ?? '';
    if (key === '.' && current.includes('.')) return;
    if (key === '.' && current === '') { onChangeText?.('0.'); return; }
    onChangeText?.(current + key);
  };

  const handleNumericDelete = () => {
    const current = value ?? '';
    onChangeText?.(current.slice(0, -1));
  };

  const borderColor = error
    ? colors.destructive
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View className="w-full">
      {label && (
        <Text
          style={{ fontSize: 13, fontWeight: '500', color: colors.foreground, marginBottom: 8 }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: 16,
          backgroundColor: colors.input,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {leftIcon && <View style={{ paddingLeft: 12 }}>{leftIcon}</View>}

        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.foreground,
            paddingLeft: leftIcon ? 8 : 16,
            paddingRight: type === 'password' || rightIcon ? 48 : 16,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          editable={!disabled}
          showSoftInputOnFocus={isNumeric ? false : undefined}
          onFocus={() => {
            setIsFocused(true);
            if (isNumeric) setIsNumericKeyboardVisible(true);
          }}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {type === 'password' && (
          <TouchableOpacity
            style={{ position: 'absolute', right: 12, padding: 8 }}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            disabled={disabled}
          >
            <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && type !== 'password' && (
          <View style={{ paddingRight: 12 }}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
          {helperText}
        </Text>
      )}

      <NumericKeyboard
        visible={isNumeric && isNumericKeyboardVisible}
        value={value}
        inputRef={inputRef}
        onKeyPress={handleNumericKey}
        onDelete={handleNumericDelete}
        onClose={() => setIsNumericKeyboardVisible(false)}
      />
    </View>
  );
};

export { Input };
