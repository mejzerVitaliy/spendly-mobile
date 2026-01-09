import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="bg-background" style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row bg-card border-t border-border">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getIcon = () => {
          switch (route.name) {
            case 'index':
              return '🏠';
            case 'analytics':
              return '💰';
            case 'settings':
              return '⚙️';
            default:
              return '📱';
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center py-3"
          >
            <Text className="text-2xl mb-1">{getIcon()}</Text>
            <Text
              className={`text-xs font-medium ${
                isFocused ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {typeof label === 'string' ? label : route.name}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}
