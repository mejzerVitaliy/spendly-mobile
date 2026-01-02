import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

interface SwitchOption<T> {
  label: string;
  value: T;
}

interface FormSwitchProps<T extends FieldValues, V> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: SwitchOption<V>[];
  error?: string;
}

const FormSwitch = <T extends FieldValues, V extends string>({
  control,
  name,
  label,
  options,
  error,
}: FormSwitchProps<T, V>) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View className="flex-row gap-2">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-background border-input'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      isSelected ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormSwitch };
