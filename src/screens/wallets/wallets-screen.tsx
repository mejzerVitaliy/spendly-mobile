import { useState } from 'react';
import { Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useWallets } from '@/shared/hooks';
import { WalletDto, WalletType } from '@/shared/types';
import { ConfirmDialog } from '@/shared/ui';
import { formatCompact } from '@/shared/utils';
import Toast from 'react-native-toast-message';
import { CreateWalletModal, EditWalletModal } from './components';
import { ArchivedWalletCard } from './components/archived-wallet-card';
import { WalletCard } from './components/wallet-card';
import { colors } from '@/shared/theme';

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card',
  SAVINGS: 'Savings',
  CUSTOM: 'Custom',
};

function WalletActionSheet({
  wallet,
  onEdit,
  onArchive,
  onClose,
}: {
  wallet: WalletDto | null;
  onEdit: () => void;
  onArchive: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!wallet}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <View style={sheetStyles.sheet}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={55} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Platform.OS === 'ios' ? 'rgba(10,10,10,0.6)' : colors.card }]} />
        <View style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.glass.border, borderBottomWidth: 0 }]} />

        <View style={sheetStyles.inner}>
          <View style={sheetStyles.handle} />

          <View style={sheetStyles.walletInfo}>
            <Text style={sheetStyles.walletLabel}>
              {WALLET_TYPE_LABELS[wallet?.type ?? 'CUSTOM']}
            </Text>
            <Text style={sheetStyles.walletName}>{wallet?.name}</Text>
          </View>

          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [sheetStyles.action, pressed && sheetStyles.actionPressed]}
          >
            <View style={[sheetStyles.actionIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </View>
            <Text style={sheetStyles.actionText}>Edit Wallet</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={wallet?.isDefault ? undefined : onArchive}
            style={({ pressed }) => [
              sheetStyles.action,
              wallet?.isDefault && sheetStyles.actionDisabled,
              !wallet?.isDefault && pressed && sheetStyles.actionPressed,
            ]}
          >
            <View style={[sheetStyles.actionIcon, { backgroundColor: `${colors.destructive}15`, opacity: wallet?.isDefault ? 0.4 : 1 }]}>
              <Ionicons name="archive-outline" size={20} color={colors.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[sheetStyles.actionText, { color: wallet?.isDefault ? colors.mutedForeground : colors.destructive }]}>
                Archive Wallet
              </Text>
              {wallet?.isDefault && (
                <Text style={sheetStyles.actionHint}>Set another wallet as default first</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [sheetStyles.cancelBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={sheetStyles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
        </View>
      </View>
    </Modal>
  );
}

export function WalletsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const {
    wallets,
    totalBalance,
    isLoading,
    archiveMutation,
    unarchiveMutation,
    refetch,
  } = useWallets(true);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [actionSheetWallet, setActionSheetWallet] = useState<WalletDto | null>(null);
  const [editTarget, setEditTarget] = useState<WalletDto | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<WalletDto | null>(null);

  const handleLongPress = (wallet: WalletDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionSheetWallet(wallet);
  };

  const handleEditFromSheet = () => {
    const wallet = actionSheetWallet;
    setActionSheetWallet(null);
    setTimeout(() => setEditTarget(wallet), 150);
  };

  const handleArchiveFromSheet = () => {
    const wallet = actionSheetWallet;
    setActionSheetWallet(null);
    setTimeout(() => {
      if (wallet?.isDefault) {
        Toast.show({ type: 'error', text1: 'Cannot archive', text2: 'Set another wallet as default first.' });
        return;
      }
      setArchiveTarget(wallet);
    }, 150);
  };

  const handleUnarchive = async (wallet: WalletDto) => {
    try {
      await unarchiveMutation.mutateAsync(wallet.id);
      Toast.show({ type: 'success', text1: 'Wallet restored', text2: `"${wallet.name}" moved to active wallets` });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to unarchive wallet' });
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    const wallet = archiveTarget;
    setArchiveTarget(null);
    try {
      await archiveMutation.mutateAsync(wallet.id);
      Toast.show({ type: 'success', text1: 'Archived', text2: `"${wallet.name}" moved to archive` });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to archive wallet' });
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
          <Text style={styles.pageTitle}>Wallets</Text>
          <Text style={styles.pageSubtitle}>Manage your cards and balances</Text>

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

            <View style={{ padding: 22 }}>
              <Text style={styles.heroLabel}>Total Balance</Text>
              <Text style={styles.heroAmount}>
                {formatCompact(displayBalance)}{' '}
                <Text style={styles.heroCurrency}>{mainCurrency}</Text>
              </Text>
              <Text style={styles.heroMeta}>
                {activeWallets.length} active wallet{activeWallets.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Section header */}
          <View className="flex flex-row items-center justify-between mb-4">
            <Text style={styles.sectionTitle}>Your Wallets</Text>

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
              {Platform.OS === 'ios' && (
                <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
              )}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Platform.OS === 'ios' ? colors.glass.background : colors.card, borderRadius: 18 }]} />
              <View style={[StyleSheet.absoluteFillObject, { borderRadius: 18, borderWidth: 1, borderColor: colors.border }]} />
              <View style={styles.emptyIconWrap}>
                <Ionicons name="wallet-outline" size={28} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>No wallets yet</Text>
              <Text style={styles.emptyText}>Add your first wallet to start tracking your finances</Text>
            </View>
          ) : (
            activeWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                typeLabel={WALLET_TYPE_LABELS[wallet.type]}
                onLongPress={() => handleLongPress(wallet)}
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
                  Archived ({archivedWallets.length})
                </Text>
              </Pressable>

              {showArchived &&
                archivedWallets.map((wallet) => (
                  <ArchivedWalletCard
                    key={wallet.id}
                    wallet={wallet}
                    typeLabel={WALLET_TYPE_LABELS[wallet.type]}
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
        title="Archive Wallet"
        message={`Are you sure you want to archive "${archiveTarget?.name}"?`}
        confirmText="Archive"
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

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  walletInfo: {
    paddingHorizontal: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 2,
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  walletName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionPressed: {
    opacity: 0.65,
  },
  actionDisabled: {
    opacity: 0.7,
  },
  actionHint: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  cancelBtn: {
    marginTop: 2,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
});
