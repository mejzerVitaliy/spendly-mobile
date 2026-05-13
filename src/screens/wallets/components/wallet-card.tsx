import { formatCompact } from '@/shared/utils';
import { WalletDto } from '@/shared/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';

interface WalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  isArchived?: boolean;
  onLongPress?: () => void;
}

const WALLET_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CASH: 'cash-outline',
  DEBIT_CARD: 'card-outline',
  CREDIT_CARD: 'card',
  SAVINGS: 'save-outline',
  CUSTOM: 'wallet-outline',
};

export function WalletCard({ wallet, typeLabel, isArchived, onLongPress }: WalletCardProps) {
  const formattedBalance = formatCompact(wallet.currentBalance);
  const hasConvertedBalance = wallet.convertedBalance !== undefined && wallet.mainCurrencyCode;
  const formattedConvertedBalance = hasConvertedBalance ? formatCompact(wallet.convertedBalance!) : null;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    translateY.value = withTiming(0, { duration: 280 });
  }, [opacity, translateY]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const icon = WALLET_TYPE_ICONS[wallet.type] ?? 'wallet-outline';

  return (
    <Animated.View style={[cardAnimStyle, { marginBottom: 16, borderRadius: 24, overflow: 'hidden' }]}>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={350}
        style={({ pressed }) => [styles.card, isArchived && { opacity: 0.55 }, pressed && styles.cardPressed]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
        ) : null}

        <LinearGradient
          colors={
            wallet.isDefault
              ? ['rgba(34,211,238,0.12)', 'rgba(34,211,238,0.03)', 'rgba(8,8,8,0.0)']
              : ['rgba(255,255,255,0.05)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 24,
              borderWidth: 1,
              borderColor: wallet.isDefault ? 'rgba(34,211,238,0.3)' : colors.glass.border,
            },
          ]}
        />

        <View style={styles.decorCircle} />

        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBadge, { backgroundColor: wallet.isDefault ? 'rgba(34,211,238,0.15)' : colors.glass.background }]}>
                <Ionicons name={icon} size={18} color={wallet.isDefault ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletType} numberOfLines={1}>{typeLabel}</Text>
                <Text style={styles.walletName} numberOfLines={1}>{wallet.name}</Text>
              </View>
            </View>
            <View style={styles.badges}>
              {wallet.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
              {!isArchived && (
                <View style={styles.holdHint}>
                  <Ionicons name="ellipsis-horizontal" size={14} color={colors.mutedForeground} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {formattedBalance}{' '}
              <Text style={styles.balanceCurrency}>{wallet.currencyCode}</Text>
            </Text>
            {hasConvertedBalance && wallet.currencyCode !== wallet.mainCurrencyCode && (
              <Text style={styles.convertedBalance}>
                ≈ {formattedConvertedBalance} {wallet.mainCurrencyCode}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(14,14,14,0.4)' : colors.card,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardInner: {
    padding: 20,
  },
  decorCircle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  walletType: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  holdHint: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  balanceRow: {
    gap: 2,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  convertedBalance: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});
