import { useCategories } from '@/shared/hooks';
import { CategoryDto } from '@/shared/types';
import { Input, Separator, SettingsHeader } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CategoriesScreen() {
  const { getAllQuery, getFavoritesQuery, updateFavoritesMutation } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

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
        Toast.show({ type: 'info', text1: 'Limit reached', text2: 'You can select maximum 10 favorite categories' });
        return;
      }
      next = [...selectedIds, categoryId];
    }

    setSelectedIds(next);

    try {
      await updateFavoritesMutation.mutateAsync({ categoryIds: next });
    } catch (e: any) {
      setSelectedIds(previous);
      const errorMessage =
        e?.response?.data?.message || 'Error updating favorite categories';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const renderCategoryItem = (category: CategoryDto, index: number, arr: CategoryDto[]) => {
    const selected = selectedIds.includes(category.id);

    return (
      <View key={category.id}>
        <Pressable
          className="flex-row items-center justify-between py-4 active:bg-accent/50"
          onPress={() => toggleFavorite(category.id)}
          disabled={updateFavoritesMutation.isPending}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: category.color + '20' }}
            >
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </View>
            <Text className="text-base font-semibold text-foreground">
              {category.name}
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
        {index < arr.length - 1 && <Separator />}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader
            title="Categories"
            description="Select your favorite categories for quick access"
          />

          <View className="mt-4">
            <Input
              placeholder="Search category..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View className="flex-row mt-4 bg-muted rounded-lg p-1">
            <Pressable
              className={`flex-1 py-2 rounded-md ${activeTab === 'EXPENSE' ? 'bg-card' : ''}`}
              onPress={() => setActiveTab('EXPENSE')}
            >
              <Text className={`text-center font-medium ${activeTab === 'EXPENSE' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Expenses
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-2 rounded-md ${activeTab === 'INCOME' ? 'bg-card' : ''}`}
              onPress={() => setActiveTab('INCOME')}
            >
              <Text className={`text-center font-medium ${activeTab === 'INCOME' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Income
              </Text>
            </Pressable>
          </View>

          {(getAllQuery.isLoading || getFavoritesQuery.isLoading) && (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}

          {(getAllQuery.isError || getFavoritesQuery.isError) && (
            <View className="py-8 items-center justify-center">
              <Text className="text-destructive text-center">
                Failed to load categories
              </Text>
            </View>
          )}

          <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6">
            Favorite Categories ({selectedIds.length}/10)
          </Text>
          <Text className="text-xs text-muted-foreground mt-1 mb-2">
            Tap to toggle favorite. Favorites appear first when creating transactions.
          </Text>

          {!getAllQuery.isLoading && !getFavoritesQuery.isLoading && (
            <>
              {filteredCategories.map((category, index, arr) =>
                renderCategoryItem(category, index, arr)
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
