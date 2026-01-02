import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Platform, Pressable, Text, View } from 'react-native';

interface FormDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
}

const FormDatePicker = <T extends FieldValues>({
  control,
  name,
  label,
  error,
}: FormDatePickerProps<T>) => {
  const [show, setShow] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const dateValue = value ? new Date(value) : new Date();
          
          return (
            <>
              <Pressable
                onPress={() => setShow(true)}
                className="border border-input rounded-lg px-4 py-3 bg-background"
              >
                <Text className="text-base text-foreground">
                  {value
                    ? new Date(value).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Выберите дату'}
                </Text>
              </Pressable>
              
              {show && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShow(Platform.OS === 'ios');
                    if (selectedDate) {
                      onChange(selectedDate.toISOString());
                    }
                  }}
                />
              )}
            </>
          );
        }}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormDatePicker };
