import { useCategories } from '@/shared/hooks';
import { CategoryDto } from '@/shared/types';
import { getCategoryName } from '@/shared/utils';
import { SegmentedControl, SettingsHeader } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export function CategoriesScreen() {
  const { getAllQuery, getFavoritesQuery, updateFavoritesMutation } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getAllQuery.refetch(), getFavoritesQuery.refetch()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const favorites = getFavoritesQuery.data?.data ?? [];
    setSelectedIds(favorites.map((f) => f.categoryId));
  }, [getFavoritesQuery.data]);

  const filteredCategories = useMemo(() => {
    const categories = getAllQuery.data?.data ?? [];
    const q = search.trim().toLowerCase();

    const filtered = categories.filter((c) => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      const matchesType = c.type === activeTab;
      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      const aFav = selectedIds.includes(a.id);
      const bFav = selectedIds.includes(b.id);
      if (aFav !== bFav) return aFav ? -1 : 1;
      return a.order - b.order;
    });
  }, [getAllQuery.data, search, selectedIds, activeTab]);

  const toggleFavorite = async (categoryId: string) => {
    const wasSelected = selectedIds.includes(categoryId);
    const previous = selectedIds;

    let next: string[];
    if (wasSelected) {
      next = selectedIds.filter((c) => c !== categoryId);
    } else {
      if (selectedIds.length >= 10) {
        Toast.show({ type: 'info', text1: t('categories.limitReached'), text2: t('categories.limitReachedDesc') });
        return;
      }
      next = [...selectedIds, categoryId];
    }

    setSelectedIds(next);

    try {
      await updateFavoritesMutation.mutateAsync({ categoryIds: next });
    } catch (e: any) {
      setSelectedIds(previous);
      Toast.show({ type: 'error', text1: t('common.error'), text2: e?.response?.data?.message || t('categories.failedUpdate') });
    }
  };

  const isLoading = getAllQuery.isLoading || getFavoritesQuery.isLoading;
  const isError = getAllQuery.isError || getFavoritesQuery.isError;

  const tabOptions = [
    { label: t('categories.expenses'), value: 'EXPENSE' as const },
    { label: t('categories.income'), value: 'INCOME' as const },
  ];

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
            title={t('categories.title')}
            description={t('categories.description')}
          />

          <View
            className="flex-row items-center rounded-2xl border px-4 mb-4"
            style={{ backgroundColor: colors.input, borderColor: colors.border }}
          >
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('categories.searchPlaceholder')}
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

          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={tabOptions}
          />

          <View className="flex-row items-center justify-between mt-5 mb-3">
            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {t('categories.favorites')}
            </Text>
            <View
              className="px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: selectedIds.length >= 10
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: selectedIds.length >= 10
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(34,211,238,0.25)',
              }}
            >
              <Text
                className="text-[11px] font-bold"
                style={{ color: selectedIds.length >= 10 ? colors.destructive : colors.primary }}
              >
                {selectedIds.length} / 10
              </Text>
            </View>
          </View>

          {isLoading && (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {isError && !isLoading && (
            <View
              className="rounded-2xl p-4 items-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <Ionicons name="alert-circle-outline" size={24} color={colors.destructive} />
              <Text className="text-destructive text-sm font-medium mt-2 text-center">
                {t('categories.failedLoad')}
              </Text>
            </View>
          )}

          {!isLoading && !isError && (
            <>
              {filteredCategories.length === 0 ? (
                <View className="py-12 items-center justify-center">
                  <Ionicons name="search-outline" size={32} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground text-sm mt-3 text-center">
                    {search
                      ? t('categories.noResults', { query: search })
                      : t('categories.noCategories')}
                  </Text>
                </View>
              ) : (
                <View
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.glass.border,
                  }}
                >
                  {filteredCategories.map((category, index) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      selected={selectedIds.includes(category.id)}
                      onPress={() => toggleFavorite(category.id)}
                      disabled={updateFavoritesMutation.isPending}
                      showSeparator={index < filteredCategories.length - 1}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface CategoryRowProps {
  category: CategoryDto;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  showSeparator: boolean;
}

function CategoryRow({ category, selected, onPress, disabled, showSeparator }: CategoryRowProps) {
  const { i18n } = useTranslation();
  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="flex-row items-center px-4 py-3.5 active:opacity-70"
        style={selected ? { backgroundColor: 'rgba(34,211,238,0.06)' } : undefined}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: category.color + '18',
            borderWidth: 1.5,
            borderColor: selected ? category.color + '60' : category.color + '30',
          }}
        >
          <View
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </View>

        <Text
          className="flex-1 text-[15px] font-semibold"
          style={{ color: selected ? colors.foreground : colors.secondaryForeground }}
        >
          {getCategoryName(category, i18n.language)}
        </Text>

        {selected ? (
          <View
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(34,211,238,0.15)' }}
          >
            <Ionicons name="checkmark" size={15} color={colors.primary} />
          </View>
        ) : (
          <View
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.glass.background, borderWidth: 1, borderColor: colors.glass.border }}
          >
            <Ionicons name="add" size={15} color={colors.mutedForeground} />
          </View>
        )}
      </Pressable>

      {showSeparator && <View className="h-px bg-border" />}
    </>
  );
}
