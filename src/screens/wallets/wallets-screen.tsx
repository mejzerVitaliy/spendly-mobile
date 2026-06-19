import { useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useWallets } from '@/shared/hooks';
import { WalletDto } from '@/shared/types';
import { BottomSheet, ConfirmDialog } from '@/shared/ui';
import { formatCompact } from '@/shared/utils';
import Toast from 'react-native-toast-message';
import { CreateWalletModal, EditWalletModal } from './components';
import { ArchivedWalletCard } from './components/archived-wallet-card';
import { WalletCard } from './components/wallet-card';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

function WalletActionSheet({
  wallet,
  onEdit,
  onSetDefault,
  onArchive,
  onClose,
}: {
  wallet: WalletDto | null;
  onEdit: () => void;
  onSetDefault: () => void;
  onArchive: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      open={!!wallet}
      onOpenChange={(open) => { if (!open) onClose(); }}
      noWrapper
    >
      <BottomSheetView>
        <View className="px-4 pt-1 pb-10 gap-2.5">

          {/* Wallet info */}
          <View className="px-1 pb-4 border-b border-white/10 mb-1">
            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              {t(`wallets.types.${wallet?.type ?? 'CUSTOM'}`)}
            </Text>
            <Text className="text-[20px] font-bold text-foreground">{wallet?.name}</Text>
          </View>

          <Pressable
            onPress={onEdit}
            className="flex-row items-center gap-3.5 py-[15px] px-4 rounded-[18px] bg-card border border-white/10 active:opacity-65"
          >
            <View className="w-10 h-10 rounded-[13px] items-center justify-center bg-primary/[0.1]">
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-foreground">{t('wallets.editWallet')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={wallet?.isDefault ? undefined : onSetDefault}
            className={`flex-row items-center gap-3.5 py-[15px] px-4 rounded-[18px] bg-card border border-white/10 ${wallet?.isDefault ? 'opacity-60' : 'active:opacity-65'}`}
          >
            <View className="w-10 h-10 rounded-[13px] items-center justify-center" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
              <Ionicons name={wallet?.isDefault ? 'star' : 'star-outline'} size={20} color="#FBBF24" />
            </View>
            <View className="flex-1">
              <Text className={`text-[15px] font-semibold ${wallet?.isDefault ? 'text-muted-foreground' : 'text-foreground'}`}>
                {wallet?.isDefault ? t('wallets.alreadyDefault') : t('wallets.setAsDefault')}
              </Text>
              {wallet?.isDefault && (
                <Text className="text-[11px] text-muted-foreground mt-0.5">{t('wallets.alreadyDefaultDesc')}</Text>
              )}
            </View>
            {!wallet?.isDefault && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
          </Pressable>

          <Pressable
            onPress={wallet?.isDefault ? undefined : onArchive}
            className={`flex-row items-center gap-3.5 py-[15px] px-4 rounded-[18px] bg-card border border-white/10 ${wallet?.isDefault ? 'opacity-60' : 'active:opacity-65'}`}
          >
            <View className="w-10 h-10 rounded-[13px] items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.12)' }}>
              <Ionicons name="archive-outline" size={20} color={colors.destructive} />
            </View>
            <View className="flex-1">
              <Text className={`text-[15px] font-semibold ${wallet?.isDefault ? 'text-muted-foreground' : 'text-destructive'}`}>
                {t('wallets.archiveWallet')}
              </Text>
              {wallet?.isDefault && (
                <Text className="text-[11px] text-muted-foreground mt-0.5">{t('wallets.setDefaultFirst')}</Text>
              )}
            </View>
            {!wallet?.isDefault && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
          </Pressable>

          <Pressable
            onPress={onClose}
            className="py-[15px] rounded-[18px] items-center bg-card border border-white/[0.08] active:opacity-70 mt-1"
          >
            <Text className="text-[15px] font-semibold text-muted-foreground">{t('common.cancel')}</Text>
          </Pressable>

        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

export function WalletsScreen() {
  const { t } = useTranslation();
  const [showArchived, setShowArchived] = useState(false);
  const {
    wallets,
    totalBalance,
    isLoading,
    archiveMutation,
    unarchiveMutation,
    setDefaultMutation,
    refetch,
  } = useWallets(true);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [actionSheetWallet, setActionSheetWallet] = useState<WalletDto | null>(null);
  const [editTarget, setEditTarget] = useState<WalletDto | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<WalletDto | null>(null);

  const openActionSheet = (wallet: WalletDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionSheetWallet(wallet);
  };

  const handleEditFromSheet = () => {
    const wallet = actionSheetWallet;
    setActionSheetWallet(null);
    setTimeout(() => setEditTarget(wallet), 150);
  };

  const handleSetDefaultFromSheet = async () => {
    const wallet = actionSheetWallet;
    setActionSheetWallet(null);
    if (!wallet || wallet.isDefault) return;
    try {
      await setDefaultMutation.mutateAsync({ walletId: wallet.id });
      Toast.show({ type: 'success', text1: t('wallets.defaultUpdated'), text2: t('wallets.defaultUpdatedDesc', { name: wallet.name }) });
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('wallets.failedSetDefault') });
    }
  };

  const handleArchiveFromSheet = () => {
    const wallet = actionSheetWallet;
    setActionSheetWallet(null);
    setTimeout(() => setArchiveTarget(wallet), 150);
  };

  const handleUnarchive = async (wallet: WalletDto) => {
    try {
      await unarchiveMutation.mutateAsync(wallet.id);
      Toast.show({ type: 'success', text1: t('wallets.walletRestored'), text2: t('wallets.walletRestoredDesc', { name: wallet.name }) });
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('wallets.failedUnarchive') });
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    const wallet = archiveTarget;
    setArchiveTarget(null);
    try {
      await archiveMutation.mutateAsync(wallet.id);
      Toast.show({ type: 'success', text1: t('wallets.walletArchived'), text2: t('wallets.walletArchivedDesc', { name: wallet.name }) });
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('wallets.failedArchive') });
    }
  };

  const activeWallets = wallets.filter((w) => !w.isArchived);
  const archivedWallets = wallets.filter((w) => w.isArchived);
  const displayBalance = totalBalance?.totalBalance ?? 0;
  const mainCurrency = wallets[0]?.mainCurrencyCode || 'USD';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>{t('wallets.title')}</Text>
          <Text style={styles.pageSubtitle}>{t('wallets.subtitle')}</Text>

          {/* Total balance hero card */}
          <View style={styles.heroCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={45} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
            ) : null}
            <LinearGradient
              colors={['rgba(34,211,238,0.1)', 'rgba(34,211,238,0.02)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[StyleSheet.absoluteFillObject, { borderRadius: 26, borderWidth: 1, borderColor: 'rgba(34,211,238,0.2)' }]} />
            {Platform.OS !== 'ios' && (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.card, borderRadius: 26 }]} />
            )}
            <View style={styles.heroDecorCircle} />

            <View className='p-6 h-full flex justify-center'>
              <Text style={styles.heroLabel}>{t('wallets.totalBalance')}</Text>
              <Text style={styles.heroAmount}>
                {formatCompact(displayBalance)}{' '}
                <Text style={styles.heroCurrency}>{mainCurrency}</Text>
              </Text>
              <Text style={styles.heroMeta}>
                {activeWallets.length} {activeWallets.length !== 1 ? t('wallets.activeWallets') : t('wallets.activeWallet')}
              </Text>
            </View>
          </View>

          {/* Section header */}
          <View className="flex flex-row items-center justify-between mb-4">
            <Text style={styles.sectionTitle}>{t('wallets.yourWallets')}</Text>

            <Pressable
              onPress={() => setIsCreateModalVisible(true)}
              className="!flex !flex-row items-center gap-3"
            >
              <View className="w-10 h-10 rounded-3xl bg-primary/12 border border-primary/25 items-center justify-center">
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
            </Pressable>
          </View>

          {activeWallets.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Platform.OS === 'ios' ? colors.glass.background : colors.card, borderRadius: 18 }]} />
              <View style={[StyleSheet.absoluteFillObject, { borderRadius: 18, borderWidth: 1, borderColor: colors.border }]} />
              <View style={styles.emptyIconWrap}>
                <Ionicons name="wallet-outline" size={28} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>{t('wallets.noWallets')}</Text>
              <Text style={styles.emptyText}>{t('wallets.noWalletsDesc')}</Text>
            </View>
          ) : (
            activeWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                typeLabel={t(`wallets.types.${wallet.type}`)}
                onLongPress={() => openActionSheet(wallet)}
                onActionPress={() => openActionSheet(wallet)}
              />
            ))
          )}

          {/* Archived section */}
          {archivedWallets.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Pressable
                onPress={() => setShowArchived(!showArchived)}
                style={styles.archiveToggle}
              >
                <Ionicons
                  name={showArchived ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={colors.mutedForeground}
                />
                <Text style={styles.archiveToggleText}>
                  {t('wallets.archived')} ({archivedWallets.length})
                </Text>
              </Pressable>

              {showArchived &&
                archivedWallets.map((wallet) => (
                  <ArchivedWalletCard
                    key={wallet.id}
                    wallet={wallet}
                    typeLabel={t(`wallets.types.${wallet.type}`)}
                    onUnarchive={() => handleUnarchive(wallet)}
                  />
                ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <WalletActionSheet
        wallet={actionSheetWallet}
        onEdit={handleEditFromSheet}
        onSetDefault={handleSetDefaultFromSheet}
        onArchive={handleArchiveFromSheet}
        onClose={() => setActionSheetWallet(null)}
      />

      <CreateWalletModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />

      <EditWalletModal
        visible={!!editTarget}
        wallet={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        visible={!!archiveTarget}
        title={t('wallets.archiveConfirmTitle')}
        message={t('wallets.archiveConfirmMessage', { name: archiveTarget?.name })}
        confirmText={t('wallets.archive')}
        destructive
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 26,
    height: 150,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(10,10,10,0.5)' : colors.card,
  },
  heroDecorCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34,211,238,0.04)',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(34,211,238,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  heroCurrency: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  heroMeta: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
  },
  createWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  createWalletIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWalletBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyCard: {
    borderRadius: 18,
    overflow: 'hidden',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  archiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 8,
  },
  archiveToggleText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
});

