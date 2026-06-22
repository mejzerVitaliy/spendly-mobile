import { useCategories } from '@/shared/hooks';
import { CategoryType } from '@/shared/types';
import { getCategoryName } from '@/shared/utils';
import { useMemo } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormPicker, PickerItem } from './form-picker';

interface FormCategoryPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  transactionType?: 'INCOME' | 'EXPENSE';
}

export function FormCategoryPicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
  transactionType = 'EXPENSE',
}: FormCategoryPickerProps<T>) {
  const { getAllQuery, getFavoritesQuery } = useCategories();
  const { i18n, t } = useTranslation();

  const items: PickerItem[] = useMemo(() => {
    const categories = getAllQuery.data?.data ?? [];
    const favorites = getFavoritesQuery.data?.data ?? [];
    const favoriteIds = favorites.map((f) => f.categoryId);

    const categoryType: CategoryType = transactionType === 'INCOME' ? 'INCOME' : 'EXPENSE';

    const filtered = categories.filter((c) => c.type === categoryType);

    const sorted = [...filtered].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav !== bFav) return aFav ? -1 : 1;
      return a.order - b.order;
    });

    return sorted.map((category) => ({
      id: category.id,
      label: getCategoryName(category, i18n.language),
      value: category.id,
      color: category.color,
      isFavorite: favoriteIds.includes(category.id),
    }));
  }, [getAllQuery.data, getFavoritesQuery.data, transactionType, i18n.language]);

  return (
    <FormPicker
      control={control}
      name={name}
      label={label}
      error={error}
      items={items}
      isLoading={getAllQuery.isLoading}
      placeholder={t('categories.searchPlaceholder')}
      searchPlaceholder={t('categories.searchPlaceholder')}
      modalTitle={t('transaction.category')}
    />
  );
}
