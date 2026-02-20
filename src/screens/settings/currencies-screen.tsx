import { useAuth, useCurrencies, useProfile } from '@/shared/hooks';
import { ConfirmDialog, Input, Separator, SettingsHeader } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export function CurrenciesScreen() {
  const { getAllQuery, getFavoritesQuery, updateFavoritesMutation } = useCurrencies();
  const { getMeQuery } = useAuth();
  const { updateSettingsMutation } = useProfile();
  const [search, setSearch] = useState('');
  const [mainCurrencyTarget, setMainCurrencyTarget] = useState<string | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const mainCurrencyCode = getMeQuery.data?.data?.mainCurrencyCode ?? 'USD';

  useEffect(() => {
    const favorites = getFavoritesQuery.data?.data ?? [];
    setSelectedCodes(favorites.map((f) => f.currencyCode));
  }, [getFavoritesQuery.data]);

  const filteredCurrencies = useMemo(() => {
    const currencies = getAllQuery.data?.data ?? [];
    const q = search.trim().toLowerCase();

    const filtered = q
      ? currencies.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q),
        )
      : currencies;

    return [...filtered].sort((a, b) => {
      const aFav = selectedCodes.includes(a.code);
      const bFav = selectedCodes.includes(b.code);
      if (aFav !== bFav) return aFav ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [getAllQuery.data, search, selectedCodes]);

  const toggleFavorite = async (currencyCode: string) => {
    const wasSelected = selectedCodes.includes(currencyCode);
    const previous = selectedCodes;

    let next: string[];
    if (wasSelected) {
      next = selectedCodes.filter((c) => c !== currencyCode);
    } else {
      if (selectedCodes.length >= 5) {
        Toast.show({ type: 'info', text1: 'Limit reached', text2: 'You can select maximum 5 favorite currencies' });
        return;
      }
      next = [...selectedCodes, currencyCode];
    }

    setSelectedCodes(next);

    try {
      await updateFavoritesMutation.mutateAsync({ currencyCodes: next });
    } catch (e: any) {
      setSelectedCodes(previous);
      const errorMessage =
        e?.response?.data?.message || 'Error updating favorite currencies';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const handleSetMainCurrency = (currencyCode: string) => {
    if (currencyCode === mainCurrencyCode) return;
    setMainCurrencyTarget(currencyCode);
  };

  const handleMainCurrencyConfirm = async () => {
    if (!mainCurrencyTarget) return;
    const code = mainCurrencyTarget;
    setMainCurrencyTarget(null);
    try {
      await updateSettingsMutation.mutateAsync({ mainCurrencyCode: code });
      Toast.show({ type: 'success', text1: 'Main currency updated', text2: `${code} is now your main currency` });
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.message || 'Error updating main currency';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const currencies = getAllQuery.data?.data ?? [];

  const mainCurrency = currencies.find((c) => c.code === mainCurrencyCode);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader 
            title="Currencies" 
            description="Manage your preferred currencies"
          />

          <View className="mt-4">
            <Input
              placeholder="Search currency..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {(getAllQuery.isLoading || getFavoritesQuery.isLoading) && (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}

          {(getAllQuery.isError || getFavoritesQuery.isError) && (
            <View className="py-8 items-center justify-center">
              <Text className="text-destructive text-center">
                Failed to load currencies
              </Text>
            </View>
          )}

          {!getAllQuery.isLoading && mainCurrency && (
            <>
              <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6">
                Main Currency
              </Text>
              <View className="bg-card rounded-lg mt-2 px-4 py-3 border border-border">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {mainCurrency.name}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      {mainCurrency.code}
                    </Text>
                  </View>
                  <View className="bg-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-primary text-xs font-medium">Primary</Text>
                  </View>
                </View>
              </View>
              <Text className="text-xs text-muted-foreground mt-2">
                All balances and analytics are displayed in this currency
              </Text>
            </>
          )}

          <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6">
            Favorite Currencies ({selectedCodes.length}/5)
          </Text>
          <Text className="text-xs text-muted-foreground mt-1 mb-2">
            Tap to toggle favorite. Long press to set as main currency.
          </Text>

          {!getAllQuery.isLoading && !getFavoritesQuery.isLoading && (
            <>
              {filteredCurrencies.map((currency, index) => {
                const selected = selectedCodes.includes(currency.code);

                const isMain = currency.code === mainCurrencyCode;

                return (
                  <View key={currency.code}>
                    <Pressable
                      className="flex-row items-center justify-between py-4 active:bg-accent/50"
                      onPress={() => toggleFavorite(currency.code)}
                      onLongPress={() => handleSetMainCurrency(currency.code)}
                      disabled={updateFavoritesMutation.isPending || updateSettingsMutation.isPending}
                    >
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-base font-semibold text-foreground">
                            {currency.name}
                          </Text>
                          {isMain && (
                            <View className="bg-primary/20 px-2 py-0.5 rounded-full ml-2">
                              <Text className="text-primary text-xs font-medium">Main</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-muted-foreground mt-1">
                          {currency.code}
                        </Text>
                      </View>
                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10b981"
                        />
                      )}
                    </Pressable>
                    {index < filteredCurrencies.length - 1 && <Separator />}
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={!!mainCurrencyTarget}
        title="Change Main Currency"
        message={`Are you sure you want to change your main currency to ${mainCurrencyTarget}? All balances and analytics will be converted.`}
        confirmText="Confirm"
        onConfirm={handleMainCurrencyConfirm}
        onCancel={() => setMainCurrencyTarget(null)}
      />
    </SafeAreaView>
  );
}
