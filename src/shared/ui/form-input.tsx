import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...textInputProps
}: FormInputProps<T>) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border border-input rounded-lg px-4 py-3 text-base text-foreground bg-background"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString() || ''}
            placeholderTextColor="#64748b"
            {...textInputProps}
          />
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormInput };
