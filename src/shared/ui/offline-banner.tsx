import { useNetworkStatus } from '@/shared/hooks/use-network-status';
import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-48)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isOnline ? -48 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isOnline ? 0 : 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOnline]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
        backgroundColor: '#EAB308',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
      pointerEvents="none"
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#000000' }}>
        No internet connection
      </Text>
    </Animated.View>
  );
}
