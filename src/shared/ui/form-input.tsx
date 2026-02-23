import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useRef, useState } from 'react';
import { Text, TextInputProps, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<any>(null);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <BottomSheetTextInput
              ref={inputRef}
              className="border border-input rounded-2xl px-4 py-3 text-base text-foreground bg-input"
              onBlur={onBlur}
              onFocus={() => setIsKeyboardVisible(true)}
              onChangeText={onChange}
              value={value?.toString() || ''}
              placeholderTextColor="#64748b"
              showSoftInputOnFocus={numeric ? false : undefined}
              {...textInputProps}
            />
            <NumericKeyboard
              visible={numeric && isKeyboardVisible}
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
              onConfirm={() => {
                setIsKeyboardVisible(false);
                inputRef.current?.blur();
              }}
            />
          </>
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormInput };
