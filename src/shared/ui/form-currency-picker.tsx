import { useCurrencies } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormCurrencyPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
}

const FormCurrencyPicker = <T extends FieldValues>({
  control,
  name,
  label,
  error,
}: FormCurrencyPickerProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { getAllQuery, getFavoritesQuery } = useCurrencies();
  const insets = useSafeAreaInsets();

  const favoriteCodes = useMemo(
    () => {
      const favorites = getFavoritesQuery.data?.data ?? [];
      const set = new Set(favorites.map((f) => f.currencyCode))
      return set;
    },
    [getFavoritesQuery.data],
  );

  const filtered = useMemo(() => {
    const currencies = getAllQuery.data?.data ?? [];

    const q = search.trim().toLowerCase();

    const list = q
      ? currencies.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q),
        )
      : currencies;

    const fav: typeof list = [];
    const rest: typeof list = [];

    for (const c of list) {
      if (favoriteCodes.has(c.code)) fav.push(c);
      else rest.push(c);
    }

    fav.sort((a, b) => a.code.localeCompare(b.code));
    rest.sort((a, b) => a.code.localeCompare(b.code));

    return [...fav, ...rest];
  }, [getAllQuery.data, favoriteCodes, search]);

  const isLoading = getAllQuery.isLoading || getFavoritesQuery.isLoading;
  const isError = getAllQuery.isError || getFavoritesQuery.isError;

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selectedCode = typeof value === 'string' ? value : '';

        return (
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>

            <Pressable
              className="border border-input rounded-lg bg-background px-4 py-3 flex-row items-center justify-between"
              onPress={() => setIsOpen(true)}
            >
              <Text className="text-foreground">
                {selectedCode ? selectedCode : 'Select currency'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94a3b8" />
            </Pressable>

            {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}

            <Modal
              visible={isOpen}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={handleClose}
            >
              <View
                className="flex-1 bg-card"
                style={{ paddingTop: insets.top }}
              >
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
                  <Text className="text-lg font-semibold text-foreground">
                    Select currency
                  </Text>
                  <Pressable onPress={handleClose} hitSlop={8}>
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </Pressable>
                </View>

                <View className="px-5 py-3">
                  <View className="flex-row items-center bg-background border border-input rounded-lg px-3">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                      className="flex-1 py-3 px-2 text-foreground"
                      placeholder="Search by code or name"
                      placeholderTextColor="#94a3b8"
                      value={search}
                      onChangeText={setSearch}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {search.length > 0 && (
                      <Pressable onPress={() => setSearch('')} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color="#94a3b8" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {isLoading && (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
                )}

                {isError && (
                  <View className="flex-1 items-center justify-center px-5">
                    <Text className="text-destructive text-center">
                      Failed to load currencies
                    </Text>
                  </View>
                )}

                {!isLoading && !isError && (
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.code}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
                    renderItem={({ item }) => {
                      const isFavorite = favoriteCodes.has(item.code);
                      const isSelected = selectedCode === item.code;

                      return (
                        <Pressable
                          className="py-3 flex-row items-center justify-between"
                          onPress={() => {
                            onChange(item.code);
                            handleClose();
                          }}
                        >
                          <View className="flex-1 flex-row items-center">
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <Text className="text-base font-semibold text-foreground">
                                  {item.code}
                                </Text>
                                {isFavorite && (
                                  <Ionicons
                                    name="star"
                                    size={14}
                                    color="#eab308"
                                    style={{ marginLeft: 6 }}
                                  />
                                )}
                              </View>
                              <Text className="text-sm text-muted-foreground mt-1">
                                {item.name}
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color="#10b981"
                            />
                          )}
                        </Pressable>
                      );
                    }}
                    ItemSeparatorComponent={() => (
                      <View className="h-px bg-border" />
                    )}
                    ListEmptyComponent={() => (
                      <View className="py-10 items-center">
                        <Text className="text-muted-foreground">
                          No currencies found
                        </Text>
                      </View>
                    )}
                  />
                )}
              </View>
            </Modal>
          </View>
        );
      }}
    />
  );
};

export { FormCurrencyPicker };
