import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

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
  return (
    <View className="flex-row bg-muted rounded-lg p-1">
      {options.map((option, index) => {
        const isActive = option.value === value;
        
        return (
          <Pressable
            key={index}
            onPress={() => onChange(option.value)}
            className={`px-3 py-2 rounded-md ${
              isActive ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={size}
              color={isActive ? '#ffffff' : '#9ca3af'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export { IconSwitch };
export type { IconSwitchOption };

