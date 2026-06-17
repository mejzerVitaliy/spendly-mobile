import { useAuth, useCurrencies, useProfile } from '@/shared/hooks';
import { SettingsHeader } from '@/shared/ui';
import { CurrencyDto } from '@/shared/types';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export function CurrenciesScreen() {
  const { getAllQuery, getFavoritesQuery, updateFavoritesMutation } = useCurrencies();
  const { getMeQuery } = useAuth();
  const { updateSettingsMutation } = useProfile();

  const [search, setSearch] = useState('');
  const [mainCurrencyTarget, setMainCurrencyTarget] = useState<string | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getAllQuery.refetch(), getFavoritesQuery.refetch(), getMeQuery.refetch()]);
    setRefreshing(false);
  };

  const mainCurrencyCode = getMeQuery.data?.data?.mainCurrencyCode ?? 'USD';

  useEffect(() => {
    const favorites = getFavoritesQuery.data?.data ?? [];
    setSelectedCodes(favorites.map((f) => f.currencyCode));
  }, [getFavoritesQuery.data]);

  const allCurrencies = getAllQuery.data?.data ?? [];

  const filteredCurrencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? allCurrencies.filter(
          (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
        )
      : allCurrencies;

    return [...filtered].sort((a, b) => {
      if (a.code === mainCurrencyCode) return -1;
      if (b.code === mainCurrencyCode) return 1;
      const aFav = selectedCodes.includes(a.code);
      const bFav = selectedCodes.includes(b.code);
      if (aFav !== bFav) return aFav ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [allCurrencies, search, selectedCodes, mainCurrencyCode]);

  const mainCurrency = allCurrencies.find((c) => c.code === mainCurrencyCode);

  const toggleFavorite = async (currencyCode: string) => {
    if (currencyCode === mainCurrencyCode) return;
    const wasSelected = selectedCodes.includes(currencyCode);
    const previous = selectedCodes;

    let next: string[];
    if (wasSelected) {
      next = selectedCodes.filter((c) => c !== currencyCode);
    } else {
      if (selectedCodes.length >= 5) {
        Toast.show({ type: 'info', text1: 'Limit reached', text2: 'Maximum 5 favorites allowed' });
        return;
      }
      next = [...selectedCodes, currencyCode];
    }

    setSelectedCodes(next);
    try {
      await updateFavoritesMutation.mutateAsync({ currencyCodes: next });
    } catch (e: any) {
      setSelectedCodes(previous);
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message || 'Failed to update' });
    }
  };

  const handleMainCurrencyConfirm = async () => {
    if (!mainCurrencyTarget) return;
    const code = mainCurrencyTarget;
    setMainCurrencyTarget(null);
    try {
      await updateSettingsMutation.mutateAsync({ mainCurrencyCode: code });
      Toast.show({ type: 'success', text1: 'Main currency updated', text2: `${code} is now your main currency` });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message || 'Failed to update main currency' });
    }
  };

  const isLoading = getAllQuery.isLoading || getFavoritesQuery.isLoading;
  const isError = getAllQuery.isError || getFavoritesQuery.isError;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View className="px-5 py-4">
          <SettingsHeader
            title="Currencies"
            description="Choose your main currency and pin favorites for quick wallet creation"
          />

          {/* Search */}
          <View
            className="flex-row items-center rounded-2xl border px-4 mb-5"
            style={{ backgroundColor: colors.input, borderColor: colors.border }}
          >
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search currencies..."
              placeholderTextColor={colors.mutedForeground}
              style={{
                flex: 1,
                paddingVertical: 13,
                paddingLeft: 10,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* Loading */}
          {isLoading && (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <View
              className="rounded-2xl p-4 items-center mb-4"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <Ionicons name="alert-circle-outline" size={24} color={colors.destructive} />
              <Text className="text-destructive text-sm font-medium mt-2 text-center">
                Failed to load currencies
              </Text>
            </View>
          )}

          {!isLoading && !isError && (
            <>
              {/* Main Currency Card */}
              {mainCurrency && (
                <>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Main Currency
                    </Text>
                  </View>
                  <View
                    className="rounded-3xl p-4 mb-2"
                    style={{
                      backgroundColor: 'rgba(34,211,238,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(34,211,238,0.25)',
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-11 h-11 rounded-2xl items-center justify-center"
                          style={{ backgroundColor: 'rgba(34,211,238,0.15)' }}
                        >
                          <Text className="text-[16px] font-bold" style={{ color: colors.primary }}>
                            {mainCurrency.code.slice(0, 2)}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-[15px] font-bold text-foreground">
                            {mainCurrency.name}
                          </Text>
                          <Text className="text-[12px] font-medium" style={{ color: colors.primary }}>
                            {mainCurrency.code}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(34,211,238,0.15)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)' }}
                      >
                        <Ionicons name="star" size={11} color={colors.primary} />
                        <Text className="text-[11px] font-bold" style={{ color: colors.primary }}>
                          Main
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Warning alert */}
                  <AlertBanner
                    icon="information-circle-outline"
                    message="Changing the main currency recalculates all wallet balances and analytics using current exchange rates."
                    color={colors.info}
                    bg="rgba(14,165,233,0.08)"
                    border="rgba(14,165,233,0.2)"
                  />
                </>
              )}

              {/* Favorites section header */}
              <View className="flex-row items-center justify-between mt-5 mb-3">
                <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  All Currencies
                </Text>
                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: selectedCodes.length >= 5
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(34,211,238,0.12)',
                    borderWidth: 1,
                    borderColor: selectedCodes.length >= 5
                      ? 'rgba(239,68,68,0.3)'
                      : 'rgba(34,211,238,0.25)',
                  }}
                >
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: selectedCodes.length >= 5 ? colors.destructive : colors.primary }}
                  >
                    ★ {selectedCodes.length} / 5
                  </Text>
                </View>
              </View>

              {/* Currency list */}
              {filteredCurrencies.length === 0 ? (
                <View className="py-12 items-center">
                  <Ionicons name="search-outline" size={32} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground text-sm mt-3">
                    No results for &quot;{search}&quot;
                  </Text>
                </View>
              ) : (
                <View
                  className="rounded-3xl overflow-hidden"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
                >
                  {filteredCurrencies.map((currency, index) => (
                    <CurrencyRow
                      key={currency.code}
                      currency={currency}
                      isMain={currency.code === mainCurrencyCode}
                      isFavorite={selectedCodes.includes(currency.code)}
                      onToggleFavorite={() => toggleFavorite(currency.code)}
                      onSetMain={() => setMainCurrencyTarget(currency.code)}
                      disabled={updateFavoritesMutation.isPending || updateSettingsMutation.isPending}
                      showSeparator={index < filteredCurrencies.length - 1}
                    />
                  ))}
                </View>
              )}

              <View className="h-8" />
            </>
          )}
        </View>
      </ScrollView>

      {/* Confirm change main currency */}
      <ChangeCurrencyDialog
        visible={!!mainCurrencyTarget}
        currencyCode={mainCurrencyTarget}
        currentCode={mainCurrencyCode}
        isPending={updateSettingsMutation.isPending}
        onConfirm={handleMainCurrencyConfirm}
        onCancel={() => setMainCurrencyTarget(null)}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface AlertBannerProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  message: string;
  color: string;
  bg: string;
  border: string;
}

function AlertBanner({ icon, message, color, bg, border }: AlertBannerProps) {
  return (
    <View
      className="flex-row items-start gap-3 rounded-2xl p-3.5 mt-3"
      style={{ backgroundColor: bg, borderWidth: 1, borderColor: border }}
    >
      <Ionicons name={icon} size={18} color={color} style={{ marginTop: 1 }} />
      <Text className="flex-1 text-[13px] leading-[19px]" style={{ color }}>
        {message}
      </Text>
    </View>
  );
}

interface CurrencyRowProps {
  currency: CurrencyDto;
  isMain: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSetMain: () => void;
  disabled: boolean;
  showSeparator: boolean;
}

function CurrencyRow({
  currency,
  isMain,
  isFavorite,
  onToggleFavorite,
  onSetMain,
  disabled,
  showSeparator,
}: CurrencyRowProps) {
  return (
    <>
      <View
        className="flex-row items-center px-4 py-3"
        style={isMain ? { backgroundColor: 'rgba(34,211,238,0.05)' } : undefined}
      >
        {/* Code badge */}
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{
            backgroundColor: isMain
              ? 'rgba(34,211,238,0.15)'
              : isFavorite
              ? 'rgba(234,179,8,0.12)'
              : colors.glass.background,
            borderWidth: 1,
            borderColor: isMain
              ? 'rgba(34,211,238,0.3)'
              : isFavorite
              ? 'rgba(234,179,8,0.25)'
              : colors.glass.border,
          }}
        >
          <Text
            className="text-[11px] font-bold"
            style={{
              color: isMain
                ? colors.primary
                : isFavorite
                ? colors.warning
                : colors.mutedForeground,
            }}
          >
            {currency.code.slice(0, 2)}
          </Text>
        </View>

        {/* Name + code */}
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-foreground" numberOfLines={1}>
            {currency.name}
          </Text>
          <Text className="text-[12px] text-muted-foreground mt-0.5">
            {currency.code}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
          {isMain ? (
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(34,211,238,0.15)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)' }}
            >
              <Ionicons name="star" size={10} color={colors.primary} />
              <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>
                Main
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={onSetMain}
              disabled={disabled}
              hitSlop={8}
              className="px-2.5 py-1 rounded-full active:opacity-60"
              style={{ backgroundColor: colors.glass.background, borderWidth: 1, borderColor: colors.glass.border }}
            >
              <Text className="text-[11px] font-semibold text-muted-foreground">
                Set Main
              </Text>
            </Pressable>
          )}

          {!isMain && (
            <Pressable
              onPress={onToggleFavorite}
              disabled={disabled}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center active:opacity-60"
              style={{
                backgroundColor: isFavorite ? 'rgba(234,179,8,0.12)' : colors.glass.background,
                borderWidth: 1,
                borderColor: isFavorite ? 'rgba(234,179,8,0.3)' : colors.glass.border,
              }}
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={15}
                color={isFavorite ? colors.warning : colors.mutedForeground}
              />
            </Pressable>
          )}
        </View>
      </View>

      {showSeparator && (
        <View style={{ height: 1, backgroundColor: colors.glass.border, marginLeft: 60 }} />
      )}
    </>
  );
}

interface ChangeCurrencyDialogProps {
  visible: boolean;
  currencyCode: string | null;
  currentCode: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ChangeCurrencyDialog({
  visible,
  currencyCode,
  currentCode,
  isPending,
  onConfirm,
  onCancel,
}: ChangeCurrencyDialogProps) {
  const content = (
    <View className="w-full bg-card rounded-3xl p-6 border border-white/[0.08]"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.6, shadowRadius: 40, elevation: 20 }}
    >
      {/* Icon */}
      <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(234,179,8,0.12)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)' }}
      >
        <Ionicons name="swap-horizontal-outline" size={22} color={colors.warning} />
      </View>

      <Text className="text-[18px] font-bold text-foreground mb-2">
        Change Main Currency
      </Text>
      <Text className="text-[14px] text-muted-foreground leading-[21px] mb-2">
        Switch from{' '}
        <Text className="text-foreground font-semibold">{currentCode}</Text>
        {' '}to{' '}
        <Text className="text-foreground font-semibold">{currencyCode}</Text>
        {' '}as your main currency?
      </Text>

      {/* Warning banner */}
      <View className="flex-row items-start gap-2 rounded-xl p-3 mb-6"
        style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)' }}
      >
        <Ionicons name="warning-outline" size={15} color={colors.warning} style={{ marginTop: 1 }} />
        <Text className="flex-1 text-[12px] leading-[17px]" style={{ color: colors.warning }}>
          All converted balances and analytics will be recalculated using current exchange rates.
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          disabled={isPending}
          className="flex-1 py-[13px] rounded-2xl items-center border border-border bg-secondary active:opacity-70"
        >
          <Text className="text-muted-foreground font-semibold text-[15px]">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isPending}
          className="flex-1 py-[13px] rounded-2xl items-center active:opacity-70"
          style={{ backgroundColor: colors.warning, opacity: isPending ? 0.7 : 1 }}
        >
          <Text className="font-bold text-[15px]" style={{ color: colors.warningForeground }}>
            {isPending ? 'Updating...' : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={40}
          tint="systemUltraThinMaterialDark"
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: colors.overlayLight }}
        >
          {content}
        </BlurView>
      ) : (
        <View className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: colors.overlay }}
        >
          {content}
        </View>
      )}
    </Modal>
  );
}
