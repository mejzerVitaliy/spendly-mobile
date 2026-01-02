import { Picker } from '@react-native-picker/picker';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, View } from 'react-native';

interface PickerOption {
  label: string;
  value: string;
}

interface FormPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: PickerOption[];
  error?: string;
}

const FormPicker = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  error,
}: FormPickerProps<T>) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View className="border border-input rounded-lg overflow-hidden bg-background">
            <Picker
              style={{ color: 'white' }}
              selectedValue={value}
              onValueChange={onChange}
            >
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormPicker };
