import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const indicatorInset = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = containerWidth > 0 ? containerWidth / Math.max(options.length, 1) : 0;

  useEffect(() => {
    indicatorX.value = withTiming(activeIndex * segmentWidth + indicatorInset, { duration: 220 });
  }, [activeIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      className={`flex-row bg-muted rounded-2xl p-1 relative overflow-hidden ${className}`}
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View
          className="absolute top-1 bottom-1 rounded-xl bg-card"
          style={[{ width: Math.max(segmentWidth - indicatorInset * 2, 0) }, indicatorStyle]}
        />
      )}

      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 py-2.5 px-3 rounded-xl"
          >
            <Text
              className={`text-center font-medium ${
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
