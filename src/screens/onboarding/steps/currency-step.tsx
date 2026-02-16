import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Input } from '@/shared/ui';
import { currencyApi } from '@/shared/services/api/currency.api';
import { CurrencyDto } from '@/shared/types';

interface CurrencyStepProps {
  selected: string;
  onSelect: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CurrencyStep({ selected, onSelect, onNext, onBack }: CurrencyStepProps) {
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    currencyApi.getAll().then((res) => {
      setCurrencies(res.data);
      setIsLoading(false);
    });
  }, []);

  const filteredCurrencies = currencies.filter((currency) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query)
    );
  });

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
        Select your currency
      </Text>
      <Text className="text-base text-muted-foreground mb-6">
        Choose the main currency for your wallets.
      </Text>

      <Input 
        placeholder="Search by code or name" 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView className="flex-1 my-4" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          {filteredCurrencies.map((currency) => {
            const isSelected = selected === currency.code;
            return (
              <Pressable
                key={currency.code}
                onPress={() => onSelect(currency.code)}
                className={`px-4 py-4 rounded-xl border-2 flex-row gap-2 justify-between items-center ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  numberOfLines={1}
                  className={`text-base max-w-[80%] font-medium ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {currency.name}
                </Text>
                <Text
                  className={`text-sm ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {currency.code}
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
          <Button title="Continue" onPress={onNext} disabled={!selected} />
        </View>
      </View>
    </View>
  );
}
