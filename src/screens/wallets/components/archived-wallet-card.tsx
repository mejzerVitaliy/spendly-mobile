import { WalletDto } from '@/shared/types';
import { formatCompact } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface ArchivedWalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  onUnarchive: () => void;
}

export function ArchivedWalletCard({ wallet, typeLabel, onUnarchive }: ArchivedWalletCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-700 bg-slate-900/40 px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[11px] uppercase tracking-widest text-slate-400">{typeLabel}</Text>
          <Text className="mt-1 text-base font-semibold text-slate-100">{wallet.name}</Text>
          <Text className="mt-1 text-sm text-slate-400">
            {formatCompact(wallet.currentBalance)} {wallet.currencyCode}
          </Text>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-800">
          <Ionicons name="archive-outline" size={16} color="#94A3B8" />
        </View>
      </View>

      <Pressable
        onPress={onUnarchive}
        className="mt-4 flex-row items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5"
      >
        <Ionicons name="reload-outline" size={16} color="#34D399" />
        <Text className="ml-2 text-sm font-medium text-emerald-300">Unarchive</Text>
      </Pressable>
    </View>
  );
}
