import { useWallets } from '@/shared/hooks';
import { useEffect, useMemo } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { FormPicker, PickerItem } from './form-picker';

interface FormWalletPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
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
}: WalletPickerFieldProps<T>) {
  useEffect(() => {
    if (!value && defaultWalletId) {
      onChange(defaultWalletId);
    }
  }, [defaultWalletId, onChange, value]);

  return (
    <FormPicker
      control={control}
      name={name}
      label={label}
      error={error}
      items={items}
      isLoading={isLoading}
      placeholder="Select wallet"
      searchPlaceholder="Search wallets..."
      modalTitle="Select Wallet"
    />
  );
}

export function FormWalletPicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
}: FormWalletPickerProps<T>) {
  const { wallets, defaultWallet, isLoading } = useWallets();

  const items: PickerItem[] = useMemo(() => {
    const activeWallets = wallets.filter((w) => !w.isArchived);

    return activeWallets.map((wallet) => ({
      id: wallet.id,
      label: wallet.name,
      value: wallet.id,
      subtitle: `${wallet.currencyCode} ${(wallet.currentBalance / 100).toFixed(2)}${wallet.isDefault ? ' • Default' : ''}`,
    }));
  }, [wallets]);

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
          />
        );
      }}
    />
  );
}
