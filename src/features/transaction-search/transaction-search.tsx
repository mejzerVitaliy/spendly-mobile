import { TextInput, View } from 'react-native';

interface TransactionSearchProps {
  onSearchChange: (search: string) => void;
}

export function TransactionSearch({ onSearchChange }: TransactionSearchProps) {
  return (
    <View className="mb-4">
      <TextInput
        onChangeText={onSearchChange}
        placeholder="Search transactions..."
        placeholderTextColor="#9ca3af"
        className="bg-card border border-border rounded-lg px-4 py-3 text-foreground"
      />
    </View>
  );
}
