import { TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  className?: string;
  placeholder: string;
  value?: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'email' | 'password';
  error?: string;
}

const Input = ({
  className,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  ...props
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const keyboardType = type === 'email' ? 'email-address' : 'default';
  const secureTextEntry = type === 'password' && !isPasswordVisible;

  return (
    <View className="w-full">
      <View className="relative">
        <TextInput
          className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 h-12 ${className || ''}`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          {...props}
        />
        
        {type === 'password' && (
          <TouchableOpacity
            className="absolute right-3 top-3"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text className="text-gray-500 text-sm">
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};

export { Input };