import { formatCompact } from '@/shared/utils';
import { WalletDto } from '@/shared/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface WalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  isArchived?: boolean;
  onSetDefault?: () => void;
  onArchive?: () => void;
}

export function WalletCard({
  wallet,
  typeLabel,
  isArchived,
  onSetDefault,
  onArchive,
}: WalletCardProps) {
  const formattedBalance = formatCompact(wallet.currentBalance);
  const hasConvertedBalance = wallet.convertedBalance !== undefined && wallet.mainCurrencyCode;
  const formattedConvertedBalance = hasConvertedBalance
    ? formatCompact(wallet.convertedBalance!)
    : null;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    translateY.value = withTiming(0, { duration: 280 });
  }, [opacity, translateY]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const gradientColors = wallet.isDefault
    ? (['#2563EB', '#1D4ED8', '#0F172A'] as const)
    : (['#1E293B', '#0F172A', '#020617'] as const);

  return (
    <Animated.View style={cardAnimStyle}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`rounded-3xl p-5 mb-4 border overflow-hidden ${
          wallet.isDefault ? 'border-blue-400/60' : 'border-slate-700/80'
        } ${isArchived ? 'opacity-60' : ''}`}
      >
        <View className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10" />

        <View className="flex-row items-start justify-between mb-6">
          <View>
            <Text className="text-slate-200/90 text-xs uppercase tracking-widest">{typeLabel}</Text>
            <Text className="text-white text-xl font-semibold mt-1">{wallet.name}</Text>
          </View>
          {wallet.isDefault && (
            <View className="bg-white/15 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">Default</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">
              {formattedBalance} {wallet.currencyCode}
            </Text>
            {hasConvertedBalance && wallet.currencyCode !== wallet.mainCurrencyCode && (
              <Text className="text-slate-300 text-sm mt-1">
                ≈ {formattedConvertedBalance} {wallet.mainCurrencyCode}
              </Text>
            )}
          </View>
        </View>

        {!isArchived && !wallet.isDefault && (onSetDefault || onArchive) && (
          <View className="flex-row gap-2 mt-4 pt-4 border-t border-white/15">
            {onSetDefault && (
              <Pressable
                onPress={onSetDefault}
                className="flex-1 bg-white/15 py-2.5 rounded-2xl items-center"
              >
                <Text className="text-white text-sm font-medium">Set Default</Text>
              </Pressable>
            )}
            {onArchive && (
              <Pressable
                onPress={onArchive}
                className="flex-1 bg-red-500/20 py-2.5 rounded-2xl items-center"
              >
                <Text className="text-red-200 text-sm font-medium">Archive</Text>
              </Pressable>
            )}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}
