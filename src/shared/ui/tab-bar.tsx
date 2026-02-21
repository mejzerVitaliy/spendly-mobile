import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
 useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

const INDICATOR_WIDTH = 32;

interface TabButtonProps {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  accessibilityLabel?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
}

function TabButton({
  route,
  isFocused,
  onPress,
  onLongPress,
  label,
  accessibilityLabel,
  onLayout,
}: TabButtonProps) {
  const scale = useSharedValue(1);
  const iconOpacity = useSharedValue(isFocused ? 1 : 0.5);
  const textOpacity = useSharedValue(isFocused ? 1 : 0.5);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 12,
      stiffness: 180,
    });
    iconOpacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 250 });
    textOpacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 250 });
    translateY.value = withSpring(isFocused ? -2 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, iconOpacity, scale, textOpacity, translateY]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: iconOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (route.name) {
      case 'index':
        return 'home';
      case 'analytics':
        return 'bar-chart';
      case 'wallets':
        return 'wallet';
      case 'settings':
        return 'settings';
      default:
        return 'apps';
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onLongPress={onLongPress}
      onLayout={onLayout}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Ionicons
          name={getIconName()}
          size={22}
          color={isFocused ? '#8B5CF6' : '#FFFFFF'}
        />
      </Animated.View>
      <AnimatedText style={[styles.tabLabel, animatedTextStyle, { color: isFocused ? '#8B5CF6' : '#9CA3AF' }]}>
        {label}
      </AnimatedText>
    </Pressable>
  );
}

function CenterButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(1.15, { damping: 15, stiffness: 200 });
    rotate.value = withTiming(90, { duration: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    rotate.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.centerButtonWrapper}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.centerButton, animatedStyle]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

interface TabBarWithModalProps extends BottomTabBarProps {
  onCreateTransaction?: () => void;
}

export function TabBar({ state, descriptors, navigation, onCreateTransaction }: TabBarWithModalProps) {
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const tabLayoutsRef = useRef<({ x: number; width: number } | null)[]>([]);
  const sectionsXRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  useEffect(() => {
    const layout = tabLayoutsRef.current[state.index];
    if (!layout) return;

    const targetX = layout.x + layout.width / 2 - INDICATOR_WIDTH / 2;
    indicatorX.value = withSpring(targetX, {
      damping: 20,
      stiffness: 120,
    });
  }, [state.index, layoutVersion, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleCenterButtonPress = () => {
    onCreateTransaction?.();
  };

  const renderTabButton = (route: any, index: number, section: 'left' | 'right') => {
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

    return (
      <TabButton
        key={route.key}
        route={route}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
        label={typeof label === 'string' ? label : route.name}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onLayout={(e) => {
          const { x, width } = e.nativeEvent.layout;
          const sectionX = sectionsXRef.current[section];
          tabLayoutsRef.current[index] = { x: sectionX + x, width };
          setLayoutVersion((v) => v + 1);
        }}
      />
    );
  };

  const leftTabs = state.routes.slice(0, 2);
  const rightTabs = state.routes.slice(2, 4);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <View style={styles.tabBar}>
        <View
          style={styles.tabSection}
          onLayout={(e) => {
            sectionsXRef.current.left = e.nativeEvent.layout.x;
            setLayoutVersion((v) => v + 1);
          }}
        >
          {leftTabs.map((route, index) => renderTabButton(route, index, 'left'))}
        </View>

        <CenterButton onPress={handleCenterButtonPress} />

        <View
          style={styles.tabSection}
          onLayout={(e) => {
            sectionsXRef.current.right = e.nativeEvent.layout.x;
            setLayoutVersion((v) => v + 1);
          }}
        >
          {rightTabs.map((route, index) => renderTabButton(route, index + 2, 'right'))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    height: 70,
  },
  tabSection: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradientButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
