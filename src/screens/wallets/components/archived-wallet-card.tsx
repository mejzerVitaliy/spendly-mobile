import { WalletDto } from '@/shared/types';
import { formatCompact } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

interface ArchivedWalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  onUnarchive: () => void;
}

export function ArchivedWalletCard({ wallet, typeLabel, onUnarchive }: ArchivedWalletCardProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Platform.OS === 'ios' ? colors.glass.background : colors.card, borderRadius: 16 }]} />
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: 16, borderWidth: 1, borderColor: colors.border }]} />

      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
            <Text style={styles.name}>{wallet.name}</Text>
            <Text style={styles.balance}>
              {formatCompact(wallet.currentBalance)} {wallet.currencyCode}
            </Text>
          </View>

          <View style={styles.archiveIcon}>
            <Ionicons name="archive-outline" size={16} color={colors.mutedForeground} />
          </View>
        </View>

        <Pressable
          onPress={onUnarchive}
          style={({ pressed }) => [styles.restoreBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="reload-outline" size={15} color={colors.success} />
          <Text style={styles.restoreText}>{t('wallets.restore')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  inner: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  balance: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  archiveIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
});
