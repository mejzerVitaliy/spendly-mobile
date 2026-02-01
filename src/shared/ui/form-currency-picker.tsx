import { useCurrencies } from '@/shared/hooks';
import { useMemo } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { FormPicker, PickerItem } from './form-picker';

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
  const { getAllQuery, getFavoritesQuery } = useCurrencies();

  const items: PickerItem[] = useMemo(() => {
    const currencies = getAllQuery.data?.data ?? [];
    const favorites = getFavoritesQuery.data?.data ?? [];
    const favoriteCodes = new Set(favorites.map((f) => f.currencyCode));

    const fav: typeof currencies = [];
    const rest: typeof currencies = [];

    for (const c of currencies) {
      if (favoriteCodes.has(c.code)) fav.push(c);
      else rest.push(c);
    }

    fav.sort((a, b) => a.code.localeCompare(b.code));
    rest.sort((a, b) => a.code.localeCompare(b.code));

    const sorted = [...fav, ...rest];

    return sorted.map((currency) => ({
      id: currency.code,
      label: currency.code,
      value: currency.code,
      subtitle: currency.name,
      isFavorite: favoriteCodes.has(currency.code),
    }));
  }, [getAllQuery.data, getFavoritesQuery.data]);

  return (
    <FormPicker
      control={control}
      name={name}
      label={label}
      error={error}
      items={items}
      isLoading={getAllQuery.isLoading || getFavoritesQuery.isLoading}
      placeholder="Select currency"
      searchPlaceholder="Search by code or name..."
      modalTitle="Select Currency"
    />
  );
};

export { FormCurrencyPicker };
