import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

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
  const [modalVisible, setModalVisible] = useState(false);
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
          <View className="mb-4">
            {label && (
              <Text className="text-sm font-medium text-foreground mb-2">
                {label}
              </Text>
            )}

            <Pressable
              className="flex-row items-center justify-between bg-background border border-border rounded-lg px-4 py-3"
              onPress={() => setModalVisible(true)}
            >
              {selectedItem ? (
                <View className="flex-row items-center flex-1">
                  {selectedItem.icon}
                  {selectedItem.color && (
                    <View
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: selectedItem.color }}
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-foreground">{selectedItem.label}</Text>
                    {selectedItem.subtitle && (
                      <Text className="text-muted-foreground text-xs mt-0.5">
                        {selectedItem.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text className="text-muted-foreground">{placeholder}</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </Pressable>

            {error && (
              <Text className="text-destructive text-sm mt-1">{error}</Text>
            )}

            <Modal
              visible={modalVisible}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setModalVisible(false)}
            >
              <View className="flex-1 bg-background">
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                  <Text className="text-lg font-semibold text-foreground">
                    {modalTitle}
                  </Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </Pressable>
                </View>

                <View className="px-4 py-3">
                  <View className="flex-row items-center bg-input border border-border rounded-lg px-3">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                      className="flex-1 py-3 px-2 text-foreground"
                      placeholder={searchPlaceholder}
                      placeholderTextColor="#9ca3af"
                      value={search}
                      onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                      <Pressable onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {isLoading ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
                ) : (
                  <ScrollView className="flex-1 px-4">
                    {filteredItems.map((item) => {
                      const isSelected = value === item.id;

                      return (
                        <Pressable
                          key={item.id}
                          className={`flex-row items-center py-3 px-3 mb-2 rounded-lg ${
                            isSelected ? 'bg-primary/10' : 'bg-card'
                          }`}
                          onPress={() => {
                            onChange(item.id);
                            setModalVisible(false);
                            setSearch('');
                          }}
                        >
                          {item.color && (
                            <View
                              className="w-10 h-10 rounded-full items-center justify-center mr-3"
                              style={{ backgroundColor: item.color + '20' }}
                            >
                              <View
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </View>
                          )}
                          {item.icon && <View className="mr-3">{item.icon}</View>}
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text className="text-base font-medium text-foreground">
                                {item.label}
                              </Text>
                              {item.isFavorite && (
                                <Ionicons
                                  name="star"
                                  size={14}
                                  color="#f59e0b"
                                  style={{ marginLeft: 6 }}
                                />
                              )}
                            </View>
                            {item.subtitle && (
                              <Text className="text-sm text-muted-foreground mt-1">
                                {item.subtitle}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                          )}
                        </Pressable>
                      );
                    })}

                    {filteredItems.length === 0 && (
                      <View className="py-8 items-center">
                        <Text className="text-muted-foreground">No items found</Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            </Modal>
          </View>
        );
      }}
    />
  );
}
