import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { BottomSheet, type BottomSheetRef } from './bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { colors } from '@/shared/theme';

export interface PickerItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: string;
  isFavorite?: boolean;
}

interface FormPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  items: PickerItem[];
  isLoading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  modalTitle?: string;
  onSearch?: (query: string) => PickerItem[];
}

export function FormPicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
  items,
  isLoading = false,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  modalTitle = 'Select',
  onSearch,
}: FormPickerProps<T>) {
  const sheetRef = useRef<BottomSheetRef>(null);
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (onSearch) {
      return onSearch(search);
    }

    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q)
    );
  }, [items, search, onSearch]);

  const getItemById = (id: string): PickerItem | undefined => {
    return items.find((item) => item.id === id);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selectedItem = value ? getItemById(value as string) : undefined;

        return (
          <View style={styles.container}>
            {label && (
              <Text style={styles.label}>{label}</Text>
            )}

            <Pressable
              style={styles.trigger}
              onPress={() => sheetRef.current?.open()}
            >
              {selectedItem ? (
                <View style={styles.selectedRow}>
                  {selectedItem.icon}
                  {selectedItem.color && (
                    <View
                      style={[styles.colorDot, { backgroundColor: selectedItem.color }]}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedLabel}>{selectedItem.label}</Text>
                    {selectedItem.subtitle && (
                      <Text style={styles.selectedSubtitle}>{selectedItem.subtitle}</Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholder}>{placeholder}</Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
            </Pressable>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <BottomSheet
              ref={sheetRef}
              snapPoints={['50%']}
              noWrapper
              onOpenChange={(open) => { if (!open) setSearch(''); }}
            >
              <BottomSheetScrollView
                stickyHeaderIndices={[0]}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{modalTitle}</Text>
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder={searchPlaceholder}
                      placeholderTextColor={colors.mutedForeground}
                      value={search}
                      onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                      <Pressable onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                      </Pressable>
                    )}
                  </View>
                </View>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={styles.list}>
                    {filteredItems.map((item) => {
                      const isSelected = value === item.id;

                      return (
                        <Pressable
                          key={item.id}
                          style={[
                            styles.item,
                            isSelected ? styles.itemSelected : styles.itemDefault,
                          ]}
                          onPress={() => {
                            onChange(item.id);
                            sheetRef.current?.close();
                            setSearch('');
                          }}
                        >
                          {item.color && (
                            <View
                              style={[
                                styles.colorBadge,
                                { backgroundColor: item.color + '20' },
                              ]}
                            >
                              <View
                                style={[styles.colorBadgeInner, { backgroundColor: item.color }]}
                              />
                            </View>
                          )}
                          {item.icon && <View style={{ marginRight: 12 }}>{item.icon}</View>}
                          <View style={{ flex: 1 }}>
                            <View style={styles.itemLabelRow}>
                              <Text style={styles.itemLabel}>{item.label}</Text>
                              {item.isFavorite && (
                                <Ionicons
                                  name="star"
                                  size={14}
                                  color="#F59E0B"
                                  style={{ marginLeft: 6 }}
                                />
                              )}
                            </View>
                            {item.subtitle && (
                              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                            )}
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                          )}
                        </Pressable>
                      );
                    })}

                    {filteredItems.length === 0 && (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items found</Text>
                      </View>
                    )}
                  </View>
                )}
              </BottomSheetScrollView>
            </BottomSheet>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedLabel: {
    color: colors.foreground,
    fontSize: 16,
  },
  selectedSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    color: colors.mutedForeground,
    fontSize: 16,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: colors.foreground,
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemSelected: {
    backgroundColor: colors.primary + '1A',
    borderColor: colors.primary + '40',
  },
  itemDefault: {
    backgroundColor: colors.input,
    borderColor: colors.border,
  },
  colorBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  colorBadgeInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
});
