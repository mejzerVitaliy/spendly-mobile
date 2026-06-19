import { useAuth, useReports, useWallets } from '@/shared/hooks';
import { formatCompact } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

interface BalanceViewProps {
  startDate?: string;
  endDate?: string;
}

function SkeletonBlock({ width, height }: { width: number; height: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 700 }),
        withTiming(0.3, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        style,
        {
          width,
          height,
          borderRadius: 8,
          backgroundColor: colors.muted,
        },
      ]}
    />
  );
}

function StatCard({
  label,
  amount,
  currency,
  icon,
  color,
  isLoading,
}: {
  label: string;
  amount: number;
  currency: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isLoading: boolean;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isLoading) {
      opacity.value = withTiming(1, { duration: 400 });
    } else {
      opacity.value = 0;
    }
  }, [isLoading, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const content = (
    <>
      <View style={styles.statIconRow}>
        <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      {isLoading ? (
        <SkeletonBlock width={96} height={22} />
      ) : (
        <Animated.Text style={[styles.statAmount, { color }, animStyle]}>
          {formatCompact(amount)}{' '}
          <Text style={styles.statCurrency}>{currency}</Text>
        </Animated.Text>
      )}
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={35}
        tint="systemUltraThinMaterialDark"
        style={styles.statCard}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 18 }]} />
        <View
          style={[StyleSheet.absoluteFillObject, {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.glass.border,
          }]}
        />
        <View style={styles.statContent}>{content}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <View style={styles.statContent}>{content}</View>
    </View>
  );
}

const BalanceView = ({ startDate, endDate }: BalanceViewProps) => {
  const { getSummary } = useReports({ startDate, endDate });
  const { totalBalance: walletTotalBalance, isLoading: isWalletsLoading } = useWallets();
  const { getMeQuery } = useAuth();
  const { t } = useTranslation();

  const isLoading = getSummary.isLoading || isWalletsLoading;
  const data = getSummary?.data?.data;
  const totalBalance = walletTotalBalance?.totalBalance ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpense ?? 0;
  const mainCurrencyCode = getMeQuery?.data?.data?.mainCurrencyCode ?? 'USD';

  const balanceOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isLoading) {
      balanceOpacity.value = withTiming(1, { duration: 500 });
    } else {
      balanceOpacity.value = 0;
    }
  }, [isLoading, balanceOpacity]);

  const balanceStyle = useAnimatedStyle(() => ({ opacity: balanceOpacity.value }));

  const balanceCard = (
    <>
      <Text style={styles.balanceLabel}>{t('balance.totalBalance')}</Text>
      {isLoading ? (
        <SkeletonBlock width={200} height={44} />
      ) : (
        <Animated.Text style={[styles.balanceAmount, balanceStyle]}>
          {formatCompact(totalBalance)}{' '}
          <Text style={styles.balanceCurrency}>{mainCurrencyCode}</Text>
        </Animated.Text>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={45}
          tint="systemUltraThinMaterialDark"
          style={styles.mainCard}
        >
          <LinearGradient
            colors={['rgba(34,211,238,0.06)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 22 }]} />
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 22, borderWidth: 1, borderColor: colors.glass.border }]} />
          <View style={styles.mainCardContent}>{balanceCard}</View>
        </BlurView>
      ) : (
        <View style={[styles.mainCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
          <LinearGradient
            colors={['rgba(34,211,238,0.04)', 'transparent']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]}
          />
          <View style={styles.mainCardContent}>{balanceCard}</View>
        </View>
      )}

      <View style={styles.statRow}>
        <StatCard
          label={t('balance.income')}
          amount={totalIncome}
          currency={mainCurrencyCode}
          icon="arrow-down-circle"
          color={colors.success}
          isLoading={isLoading}
        />
        <StatCard
          label={t('balance.expenses')}
          amount={totalExpenses}
          currency={mainCurrencyCode}
          icon="arrow-up-circle"
          color={colors.destructive}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export { BalanceView };

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  mainCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mainCardContent: {
    padding: 20,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statContent: {
    padding: 14,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  statCurrency: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
});
