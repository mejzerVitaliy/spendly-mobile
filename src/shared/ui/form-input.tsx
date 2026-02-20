import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { NumericKeyboard } from './numeric-keyboard';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  numeric?: boolean;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  error,
  numeric = false,
  ...textInputProps
}: FormInputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              className="border border-input rounded-lg px-4 py-3 text-base text-foreground bg-background"
              onBlur={() => { onBlur(); setIsFocused(false); }}
              onFocus={() => setIsFocused(true)}
              onChangeText={onChange}
              value={value?.toString() || ''}
              placeholderTextColor="#64748b"
              showSoftInputOnFocus={numeric ? false : undefined}
              {...textInputProps}
            />
            {numeric && isFocused && (
              <NumericKeyboard
                onKeyPress={(key) => {
                  const current = value?.toString() || '';
                  if (key === '.' && current.includes('.')) return;
                  if (key === '.' && current === '') { onChange('0.'); return; }
                  onChange(current + key);
                }}
                onDelete={() => {
                  const current = value?.toString() || '';
                  onChange(current.slice(0, -1));
                }}
              />
            )}
          </>
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormInput };
