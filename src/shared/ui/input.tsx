import { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

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

  const keyboardType = type === 'email' 
    ? 'email-address' 
    : type === 'number' 
    ? 'numeric' 
    : 'default';
  
  const secureTextEntry = type === 'password' && !isPasswordVisible;

  const borderColor = error 
    ? 'border-destructive' 
    : isFocused 
    ? 'border-ring' 
    : 'border-input';

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}
      
      <View className={`relative flex-row items-center border-2 ${borderColor} rounded-lg bg-background ${disabled ? 'opacity-50' : ''}`}>
        {leftIcon && (
          <View className="pl-3">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          className={`flex-1 px-4 py-3 text-foreground ${leftIcon ? 'pl-2' : ''} ${type === 'password' || rightIcon ? 'pr-12' : ''}`}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {type === 'password' && (
          <TouchableOpacity
            className="absolute right-3 p-2"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            disabled={disabled}
          >
            <Text className="text-muted-foreground text-base">
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && type !== 'password' && (
          <View className="pr-3">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-destructive text-xs mt-1.5 ml-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-muted-foreground text-xs mt-1.5 ml-1">
          {helperText}
        </Text>
      )}
    </View>
  );
};

export { Input };
