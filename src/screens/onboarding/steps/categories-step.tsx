import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Button } from '@/shared/ui';
import { categoryApi } from '@/shared/services/api/category.api';
import { CategoryDto } from '@/shared/types';

interface CategoriesStepProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CategoriesStep({ selected, onSelect, onNext, onBack }: CategoriesStepProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      setCategories(res.data);
      setIsLoading(false);
    });
  }, []);

  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-8">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Choose your categories
      </Text>
      <Text className="text-base text-muted-foreground mb-6">
        Select the categories you use most often.
      </Text>

      <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-3">
          {categories.map((category) => {
            const isSelected = selected.includes(category.id);
            return (
              <Pressable
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                className={`px-4 py-3 rounded-xl border-2 ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 pb-8">
        <View className="flex-1">
          <Button title="Back" variant="outline" onPress={onBack} />
        </View>
        <View className="flex-1">
          <Button
            title="Continue"
            onPress={onNext}
            disabled={selected.length === 0}
          />
        </View>
      </View>
    </View>
  );
}
