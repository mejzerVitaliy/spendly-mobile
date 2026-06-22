import { BalanceView } from '@/features/balance-view';
import { EditTransaction, EditTransactionRef } from '@/features/edit-transaction';
import { PeriodSelector } from '@/features/period-selector';
import { TransactionSearch } from '@/features/transaction-search';
import { TransactionsList } from '@/features/transactions-list';
import { useHomeStore } from '@/shared/stores';
import { Transaction } from '@/shared/types';
import { getDateRangeForPeriod } from '@/shared/utils';
import { colors } from '@/shared/theme';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { AppHeader, BottomSheet, BottomSheetRef, ConfirmDialog } from '@/shared/ui';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/shared/hooks';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export function HomeScreen() {
  const editTransactionRef = useRef<EditTransactionRef>(null);
  const actionSheetRef = useRef<BottomSheetRef>(null);
  const queryClient = useQueryClient();
  const { periodType, currentDate, startDate, endDate, setDateRange } = useHomeStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const { createMutation, removeMutation } = useTransactions();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Animated sticky header
  const scrollY = useSharedValue(0);
  const stickyThreshold = useSharedValue(300);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    'worklet';
    scrollY.value = event.contentOffset.y;
  });

  const stickyStyle = useAnimatedStyle(() => {
    'worklet';
    const show = scrollY.value > stickyThreshold.value;
    return {
      opacity: withTiming(show ? 1 : 0, { duration: 220 }),
      transform: [{ translateY: withTiming(show ? 0 : -56, { duration: 220 }) }],
      pointerEvents: show ? 'auto' : 'none',
    };
  });

  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRangeForPeriod(currentDate, periodType);
    setDateRange(start, end);
  }, [currentDate, periodType, setDateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['user'], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['wallets'], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['transactions'], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['reports'], type: 'all' }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const handleTransactionPress = (transaction: Transaction) => {
    editTransactionRef.current?.open(transaction.id);
  };

  const handleTransactionLongPress = (transaction: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTransaction(transaction);
    actionSheetRef.current?.open();
  };

  const handleSearchChange = useCallback((searchText: string) => {
    setSearch(searchText);
  }, []);

  const handleEdit = () => {
    if (!selectedTransaction) return;
    actionSheetRef.current?.close();
    setTimeout(() => editTransactionRef.current?.open(selectedTransaction.id), 300);
  };

  const handleDuplicate = async () => {
    if (!selectedTransaction || selectedTransaction.transferGroupId) return;
    actionSheetRef.current?.close();
    try {
      await createMutation.mutateAsync({
        amount: selectedTransaction.amount,
        date: new Date().toISOString(),
        currencyCode: selectedTransaction.currencyCode,
        type: selectedTransaction.type,
        categoryId: selectedTransaction.categoryId!,
        description: selectedTransaction.description,
        walletId: selectedTransaction.walletId,
      });
      Toast.show({ type: 'success', text1: t('transaction.duplicated'), text2: t('transaction.duplicatedDesc') });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error?.response?.data?.message || t('transaction.failedDuplicate') });
    }
  };

  const handleDeletePress = () => {
    actionSheetRef.current?.close();
    setTimeout(() => setDeleteConfirmVisible(true), 300);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    setDeleteConfirmVisible(false);
    try {
      await removeMutation.mutateAsync({ id: selectedTransaction.id });
      Toast.show({ type: 'success', text1: t('transaction.deleted'), text2: t('transaction.deletedDesc') });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error?.response?.data?.message || t('transaction.failedDelete') });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Sticky header overlay — appears after scrolling past balance section */}
      <Animated.View style={[styles.stickyHeader, { top: insets.top }, stickyStyle]}>
        <View style={styles.stickyHeaderContent}>
          <PeriodSelector store="home" />
          <TransactionSearch onSearchChange={handleSearchChange} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top block: scrolls away. Its full height = sticky threshold */}
        <View
          onLayout={(e) => {
            stickyThreshold.value = e.nativeEvent.layout.height;
          }}
        >
          <AppHeader />
          <View style={styles.scrollableHeader}>
            <PeriodSelector store="home" />
            <TransactionSearch onSearchChange={handleSearchChange} />
          </View>
          <View style={styles.balanceSection}>
            <BalanceView startDate={startDate} endDate={endDate} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <TransactionsList
            onTransactionPress={handleTransactionPress}
            onTransactionLongPress={handleTransactionLongPress}
            startDate={startDate}
            endDate={endDate}
            search={debouncedSearch}
          />
        </View>
      </Animated.ScrollView>

      {/* Transaction long-press action sheet */}
      <BottomSheet ref={actionSheetRef} enableDynamicSizing snapPoints={[]}>
        <BottomSheetView>
          <View style={styles.actionSheet}>
            <Pressable
              onPress={handleEdit}
              style={styles.actionItem}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '1A' }]}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{t('transaction.editTitle')}</Text>
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable
              onPress={handleDuplicate}
              style={styles.actionItem}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '1A' }]}>
                <Ionicons name="copy-outline" size={20} color={colors.success} />
              </View>
              <Text style={styles.actionLabel}>{t('transaction.duplicate')}</Text>
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable
              onPress={handleDeletePress}
              style={styles.actionItem}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.destructive + '1A' }]}>
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.destructive }]}>{t('transaction.remove')}</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <ConfirmDialog
        visible={deleteConfirmVisible}
        title={t('transaction.deleteConfirmTitle')}
        message={t('transaction.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmVisible(false)}
      />

      <EditTransaction ref={editTransactionRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollableHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  balanceSection: {
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  stickyHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.background,
  },
  stickyHeaderContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  actionSheet: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
});
