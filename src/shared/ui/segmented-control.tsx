import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/shared/theme';
import { GlassView } from './glass-view';

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

  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const segmentWidth = containerWidth > 0 ? containerWidth / Math.max(options.length, 1) : 0;

  useEffect(() => {
    indicatorX.value = withTiming(activeIndex * segmentWidth + indicatorInset, { duration: 220 });
  }, [activeIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.muted,
        borderRadius: 20,
        padding: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              borderRadius: 16,
              backgroundColor: colors.glass.backgroundStrong,
              borderWidth: 1,
              borderColor: colors.glass.border,
              width: Math.max(segmentWidth - indicatorInset * 2, 0),
            },
            indicatorStyle,
          ]}
        />
      )}

      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16 }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 13,
                color: isSelected ? colors.foreground : colors.mutedForeground,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
