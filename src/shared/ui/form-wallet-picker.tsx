import { useWallets } from '@/shared/hooks';
import { useEffect, useMemo } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { FormPicker, PickerItem } from './form-picker';
import { useTranslation } from 'react-i18next';

interface FormWalletPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  excludeId?: string;
  autoSelectDefault?: boolean;
}

interface WalletPickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  items: PickerItem[];
  isLoading: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  defaultWalletId?: string;
  autoSelectDefault?: boolean;
}

function WalletPickerField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  items,
  isLoading,
  value,
  onChange,
  defaultWalletId,
  autoSelectDefault = true,
}: WalletPickerFieldProps<T>) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!value && defaultWalletId && autoSelectDefault) {
      onChange(defaultWalletId);
    }
  }, [defaultWalletId, onChange, value, autoSelectDefault]);

  return (
    <FormPicker
      control={control}
      name={name}
      label={label}
      error={error}
      items={items}
      isLoading={isLoading}
      placeholder={t('transaction.selectWallet')}
      searchPlaceholder={t('transaction.searchWallets')}
      modalTitle={t('transaction.selectWallet')}
    />
  );
}

export function FormWalletPicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
  excludeId,
  autoSelectDefault = true,
}: FormWalletPickerProps<T>) {
  const { wallets, defaultWallet, isLoading } = useWallets();

  const items: PickerItem[] = useMemo(() => {
    const activeWallets = wallets.filter((w) => !w.isArchived && w.id !== excludeId);

    return activeWallets.map((wallet) => ({
      id: wallet.id,
      label: wallet.name,
      value: wallet.id,
      subtitle: `${wallet.currencyCode} ${(wallet.currentBalance / 100).toFixed(2)}${wallet.isDefault ? ' • Default' : ''}`,
    }));
  }, [wallets, excludeId]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        return (
          <WalletPickerField
            control={control}
            name={name}
            label={label}
            error={error}
            items={items}
            isLoading={isLoading}
            value={value}
            onChange={onChange}
            defaultWalletId={defaultWallet?.id}
            autoSelectDefault={autoSelectDefault}
          />
        );
      }}
    />
  );
}
