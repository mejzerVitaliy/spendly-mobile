import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface IconSwitchOption<T> {
  value: T;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface IconSwitchProps<T> {
  value: T;
  options: [IconSwitchOption<T>, IconSwitchOption<T>];
  onChange: (value: T) => void;
  size?: number;
}

function IconSwitch<T>({ value, options, onChange, size = 20 }: IconSwitchProps<T>) {
  const indicatorInset = 1;
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = containerWidth > 0 ? containerWidth / 2 : 0;

  useEffect(() => {
    indicatorX.value = withTiming(activeIndex * segmentWidth + indicatorInset, { duration: 220 });
  }, [activeIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      className="flex-row bg-muted rounded-2xl p-1 relative overflow-hidden"
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View
          className="absolute top-1 bottom-1 rounded-xl bg-card"
          style={[{ width: Math.max(segmentWidth - indicatorInset * 2, 0) }, indicatorStyle]}
        />
      )}

      {options.map((option, index) => {
        const isActive = option.value === value;
        
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            className="flex-1 px-3 py-2.5 items-center justify-center rounded-xl"
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={size}
              color={isActive ? '#E5E7EB' : '#9CA3AF'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export { IconSwitch };
export type { IconSwitchOption };

