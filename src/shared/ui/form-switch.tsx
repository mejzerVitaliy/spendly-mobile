import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';

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

interface AnimatedSwitchProps<V> {
  value: V;
  onChange: (value: V) => void;
  options: SwitchOption<V>[];
}

function AnimatedSwitch<V extends string>({ value, onChange, options }: AnimatedSwitchProps<V>) {
  const indicatorInset = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = containerWidth > 0 ? containerWidth / Math.max(options.length, 1) : 0;

  useEffect(() => {
    indicatorX.value = withSpring(activeIndex * segmentWidth + indicatorInset, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      className="flex-row bg-muted rounded-[18px] p-1 overflow-hidden relative"
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={30}
          tint="systemUltraThinMaterialDark"
          className="absolute inset-0"
        />
      )}

      {segmentWidth > 0 && (
        <Animated.View
          className="absolute top-1 bottom-1 rounded-[14px] bg-white/[0.12] border border-white/[0.08]"
          style={[{ width: Math.max(segmentWidth - indicatorInset * 2, 0) }, indicatorStyle]}
        />
      )}

      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 py-2.5 items-center rounded-[14px]"
          >
            <Text
              className={`text-[13px] font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
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
          <AnimatedSwitch value={value as V} onChange={onChange} options={options} />
        )}
      />
      {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
    </View>
  );
};

export { FormSwitch };
