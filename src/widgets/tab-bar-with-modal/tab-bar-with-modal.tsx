import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBar } from '@/shared/ui/tab-bar';
import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { CreateTransactionForm } from '@/features/create-transaction/manually/ui';
import { CreateTransactionText } from '@/features/create-transaction/typing/create-transaction-text';
import { CreateTransactionVoice } from '@/features/create-transaction/voice/create-transaction-voice';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useOnboardingStore } from '@/shared/stores';
import { Modal, Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/shared/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useOfflineGuard } from '@/shared/hooks';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MENU_ITEM_CONFIGS = [
  {
    key: 'manual' as const,
    icon: 'create-outline' as const,
    labelKey: 'transactionMenu.manual' as const,
    accentColor: colors.primary,
    gradientColors: ['rgba(34,211,238,0.15)', 'rgba(34,211,238,0.05)'] as const,
  },
  {
    key: 'text' as const,
    icon: 'sparkles' as const,
    labelKey: 'transactionMenu.textAI' as const,
    accentColor: colors.success,
    gradientColors: ['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)'] as const,
  },
  {
    key: 'voice' as const,
    icon: 'mic-outline' as const,
    labelKey: 'transactionMenu.voiceAI' as const,
    accentColor: '#F97316',
    gradientColors: ['rgba(249,115,22,0.15)', 'rgba(249,115,22,0.05)'] as const,
  },
];

type MenuItemConfig = (typeof MENU_ITEM_CONFIGS)[number];

function MenuItem({
  item,
  idx,
  onPress,
}: {
  item: MenuItemConfig & { label: string };
  idx: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(0.75, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(idx * 70).duration(280).springify()}
      style={[styles.menuItem, { marginTop: idx === 1 ? 0 : 32 }]}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.menuButton, animStyle]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={40}
            tint="systemUltraThinMaterialDark"
            style={styles.menuButtonBlur}
          >
            <LinearGradient
              colors={item.gradientColors}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.menuButtonInner, { borderColor: `${item.accentColor}30` }]}>
              <Ionicons name={item.icon} size={28} color={item.accentColor} />
            </View>
          </BlurView>
        ) : (
          <View
            style={[
              styles.menuButtonBlur,
              { backgroundColor: `${item.accentColor}12`, borderColor: `${item.accentColor}25`, borderWidth: 1 },
            ]}
          >
            <Ionicons name={item.icon} size={28} color={item.accentColor} />
          </View>
        )}
        <Text style={styles.menuLabel}>{item.label}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

function MenuItems({ onItemPress }: { onItemPress: (key: string) => void }) {
  const { t } = useTranslation();
  const menuItems = MENU_ITEM_CONFIGS.map((cfg) => ({ ...cfg, label: t(cfg.labelKey) }));
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.menuContainer}>
      <View style={styles.menuRow}>
        {menuItems.map((item, idx) => (
          <MenuItem key={item.key} item={item} idx={idx} onPress={() => onItemPress(item.key)} />
        ))}
      </View>
    </Animated.View>
  );
}

export function TabBarWithModal(props: BottomTabBarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const manualRef = useRef<BottomSheetRef>(null);
  const textRef = useRef<BottomSheetRef>(null);
  const voiceRef = useRef<BottomSheetRef>(null);
  const { guard } = useOfflineGuard();
  const { pendingOpenCreate, setPendingOpenCreate } = useOnboardingStore();

  useEffect(() => {
    if (!pendingOpenCreate) return;
    setPendingOpenCreate(false);
    const t = setTimeout(() => manualRef.current?.open(), 500);
    return () => clearTimeout(t);
  }, [pendingOpenCreate]);

  const handleItemPress = (key: string) => {
    setMenuVisible(false);
    setTimeout(() => {
      if (key === 'manual') manualRef.current?.open();
      else if (key === 'text') textRef.current?.open();
      else if (key === 'voice') voiceRef.current?.open();
    }, 180);
  };

  return (
    <>
      <TabBar {...props} onCreateTransaction={guard(() => setMenuVisible(true))} />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={70} tint="systemUltraThinMaterialDark" style={styles.backdrop}>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,8,8,0.5)' }]} />
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setMenuVisible(false)} />
            <MenuItems onItemPress={handleItemPress} />
          </BlurView>
        ) : (
          <View className='flex-1 bg-black/90'>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setMenuVisible(false)} />
            <MenuItems onItemPress={handleItemPress} />
          </View>
        )}
      </Modal>

      <BottomSheet
        ref={manualRef}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <CreateTransactionForm onSuccess={() => manualRef.current?.close()} />
      </BottomSheet>

      <BottomSheet
        ref={textRef}
        enableDynamicSizing
        snapPoints={[]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <CreateTransactionText onSuccess={() => textRef.current?.close()} />
      </BottomSheet>

      <BottomSheet ref={voiceRef} enableDynamicSizing snapPoints={[]}>
        <CreateTransactionVoice onSuccess={() => voiceRef.current?.close()} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    bottom: '14%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
  },
  menuItem: {
    alignItems: 'center',
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonBlur: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuButtonInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    borderWidth: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    marginTop: 6,
    textAlign: 'center',
    width: 80,
  },
});
