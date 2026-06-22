import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

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
}: SegmentedControlProps<T>) {
  const indicatorInset = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
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
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 py-2.5 px-3 items-center rounded-[14px]"
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
