import { WalletDto } from '@/shared/types';
import { formatCompact } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

const WALLET_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CASH: 'cash-outline',
  DEBIT_CARD: 'card-outline',
  CREDIT_CARD: 'card',
  SAVINGS: 'save-outline',
  CUSTOM: 'wallet-outline',
};

interface ArchivedWalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  onUnarchive: () => void;
}

export function ArchivedWalletCard({ wallet, typeLabel, onUnarchive }: ArchivedWalletCardProps) {
  const { t } = useTranslation();
  const icon = WALLET_TYPE_ICONS[wallet.type] ?? 'wallet-outline';

  return (
    <View className="rounded-2xl overflow-hidden mb-3 border border-white/[0.06] bg-card opacity-70">
      <View className="px-4 py-3 flex-row items-center gap-3">

        {/* Icon */}
        <View className="w-10 h-10 rounded-[13px] bg-secondary items-center justify-center">
          <Ionicons name={icon} size={18} color={colors.mutedForeground} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
            {typeLabel}
          </Text>
          <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
            {wallet.name}
          </Text>
          <Text className="text-[13px] text-muted-foreground mt-0.5">
            {formatCompact(wallet.currentBalance)} {wallet.currencyCode}
          </Text>
        </View>

        {/* Archive badge + Restore */}
        <View className="items-end gap-2">
          <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-secondary">
            <Ionicons name="archive-outline" size={11} color={colors.mutedForeground} />
            <Text className="text-[10px] font-semibold text-muted-foreground">
              {t('wallets.archived')}
            </Text>
          </View>

          <Pressable
            onPress={onUnarchive}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-60"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' }}
          >
            <Ionicons name="arrow-up-circle-outline" size={14} color={colors.success} />
            <Text className="text-[12px] font-semibold" style={{ color: colors.success }}>
              {t('wallets.restore')}
            </Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}
