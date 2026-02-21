import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useRef } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { BottomSheet, type BottomSheetRef } from './bottom-sheet';

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
  const sheetRef = useRef<BottomSheetRef>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-RU', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isoToCalendarDate = (iso: string) => {
    return iso.slice(0, 10);
  };

  const calendarDateToIso = (dateString: string) => {
    return new Date(`${dateString}T00:00:00.000Z`).toISOString();
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const iso = typeof value === 'string' && value ? value : new Date().toISOString();
          const selectedDate = isoToCalendarDate(iso);

          const markedDates = {
            [selectedDate]: {
              selected: true,
              selectedColor: '#3b82f6',
            },
          };

          return (
            <>
              <Pressable
                onPress={() => sheetRef.current?.open()}
                className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3 bg-background"
              >
                <Text className="text-base text-foreground">{formatDate(iso)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              </Pressable>

              <BottomSheet ref={sheetRef} snapPoints={['50%']}>
                <View className="px-4 pt-2 pb-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">Select Date</Text>
                  <Calendar
                    current={selectedDate}
                    markedDates={markedDates}
                    onDayPress={(day) => {
                      onChange(calendarDateToIso(day.dateString));
                      sheetRef.current?.close();
                    }}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      monthTextColor: '#e5e7eb',
                      dayTextColor: '#e5e7eb',
                      textDisabledColor: '#6b7280',
                      todayTextColor: '#60a5fa',
                      arrowColor: '#9ca3af',
                    }}
                  />
                </View>
              </BottomSheet>
            </>
          );
        }}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormDatePicker };
