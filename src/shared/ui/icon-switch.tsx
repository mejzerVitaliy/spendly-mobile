import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';

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
  const indicatorInset = 3;
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const segmentWidth = containerWidth > 0 ? containerWidth / 2 : 0;

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

      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            className="flex-1 py-2.5 items-center justify-center rounded-[14px]"
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={size}
              color={isActive ? colors.foreground : colors.mutedForeground}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export { IconSwitch };
export type { IconSwitchOption };
