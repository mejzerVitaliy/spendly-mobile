import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Modal, Pressable, Text, View } from 'react-native';

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
  const [isOpen, setIsOpen] = useState(false);

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
                onPress={() => setIsOpen(true)}
                className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3 bg-background"
              >
                <Text className="text-base text-foreground">{formatDate(iso)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              </Pressable>

              <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsOpen(false)}
              >
                <View className="flex-1 bg-background">
                  <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                    <Text className="text-lg font-semibold text-foreground">Select Date</Text>
                    <Pressable onPress={() => setIsOpen(false)}>
                      <Ionicons name="close" size={24} color="#6b7280" />
                    </Pressable>
                  </View>

                  <View className="px-4 pt-4">
                    <Calendar
                      current={selectedDate}
                      markedDates={markedDates}
                      onDayPress={(day) => {
                        onChange(calendarDateToIso(day.dateString));
                        setIsOpen(false);
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
                </View>
              </Modal>
            </>
          );
        }}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormDatePicker };
