import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInputProps, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { NumericKeyboard } from './numeric-keyboard';
import { useNumericKeyboard } from './use-numeric-keyboard';
import { colors } from '@/shared/theme';

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
  const kb = useNumericKeyboard();

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            {numeric ? (
              // Pressable display — no TextInput, no onFocus/blur events
              <View style={styles.numericWrapper}>
                <View style={styles.numericDisplay}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: value?.toString() ? colors.foreground : colors.mutedForeground,
                    }}
                  >
                    {value?.toString() || (textInputProps.placeholder ?? '')}
                  </Text>
                </View>
                <Pressable
                  style={StyleSheet.absoluteFillObject}
                  onPress={() => { kb.open(); }}
                />
              </View>
            ) : (
              <BottomSheetTextInput
                className="border border-input rounded-2xl px-4 py-3 text-base text-foreground bg-input"
                onBlur={onBlur}
                onFocus={() => {}}
                onChangeText={onChange}
                value={value?.toString() || ''}
                placeholderTextColor={colors.mutedForeground}
                {...textInputProps}
              />
            )}

            {numeric && (
              <NumericKeyboard
                visible={kb.visible}
                value={value?.toString() || ''}
                onKeyPress={(key) => {
                  const current = value?.toString() || '';
                  onChange(current + key);
                }}
                onDelete={() => {
                  const current = value?.toString() || '';
                  onChange(current.slice(0, -1));
                }}
                onClose={kb.close}
                onClosed={() => { onBlur(); kb.onClosed(); }}
              />
            )}
          </>
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  numericWrapper: {
    position: 'relative',
  },
  numericDisplay: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.input,
    minHeight: 50,
    justifyContent: 'center',
  },
});

export { FormInput };
