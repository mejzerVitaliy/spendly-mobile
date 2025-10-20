# Архитектура проекта Spendly Mobile

## Структура проекта

```
spendly-mobile/
├── app/                    # Expo Router - file-based routing
│   ├── _layout.tsx        # Корневой layout (оборачивает все экраны)
│   ├── index.tsx          # Главный экран (маршрут "/")
│   └── [другие экраны]    # Автоматически становятся маршрутами
│
├── components/            # Переиспользуемые компоненты
│   └── ui/               # UI-компоненты (кнопки, карточки и т.д.)
│       ├── button.tsx
│       ├── card.tsx
│       └── index.ts      # Barrel export
│
├── hooks/                # Кастомные React хуки
├── utils/                # Вспомогательные функции
├── constants/            # Константы (цвета, размеры и т.д.)
└── types/                # TypeScript типы
```

## Основные концепции

### 1. Expo Router (File-based Routing)

**Как создать новый экран:**
```tsx
// app/profile.tsx
export default function ProfileScreen() {
  return <View><Text>Profile</Text></View>;
}
// Автоматически доступен по маршруту "/profile"
```

**Навигация между экранами:**
```tsx
import { router } from 'expo-router';

// Переход на другой экран
router.push('/profile');

// Назад
router.back();

// Замена текущего экрана
router.replace('/login');
```

**Вложенные маршруты:**
```
app/
  settings/
    index.tsx      # /settings
    privacy.tsx    # /settings/privacy
```

### 2. Stack Navigation

В `_layout.tsx` используется `<Stack>` — стековая навигация:

```tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="profile" options={{ title: 'Профиль' }} />
  <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
</Stack>
```

**Опции экрана:**
- `headerShown` — показывать ли заголовок
- `title` — текст заголовка
- `presentation` — тип презентации ('card', 'modal', 'transparentModal')
- `headerStyle` — стиль заголовка
- `headerTintColor` — цвет кнопок в заголовке

### 3. Базовые компоненты React Native

#### **View** — контейнер (как `<div>`)
```tsx
<View className="flex-1 bg-white p-4">
  {/* Содержимое */}
</View>
```

#### **Text** — текст (ОБЯЗАТЕЛЕН для всего текста!)
```tsx
<Text className="text-xl font-bold">Заголовок</Text>
```

#### **SafeAreaView** — безопасная область (избегает вырезов, notch)
```tsx
<SafeAreaView className="flex-1">
  {/* Содержимое не перекроется системными элементами */}
</SafeAreaView>
```

#### **Pressable** — кликабельный элемент
```tsx
<Pressable onPress={() => console.log('Clicked')}>
  <Text>Нажми меня</Text>
</Pressable>
```

#### **ScrollView** — прокрутка
```tsx
<ScrollView>
  <Text>Длинный контент...</Text>
</ScrollView>
```

#### **FlatList** — список (оптимизированный)
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

#### **TextInput** — поле ввода
```tsx
<TextInput
  placeholder="Введите текст"
  value={text}
  onChangeText={setText}
  className="border p-2 rounded"
/>
```

#### **Image** — изображения
```tsx
<Image
  source={{ uri: 'https://...' }}
  className="w-20 h-20"
/>
```

### 4. Стилизация (NativeWind)

Проект использует **NativeWind** — Tailwind CSS для React Native.

```tsx
// Flexbox
<View className="flex-1 flex-row justify-between items-center">

// Размеры
<View className="w-full h-20 p-4 m-2">

// Цвета
<View className="bg-blue-500 text-white">

// Закругления
<View className="rounded-lg rounded-full">

// Тени (только iOS, на Android используйте elevation)
<View className="shadow-lg">
```

**Responsive классы:**
```tsx
<View className="w-full md:w-1/2 lg:w-1/3">
```

### 5. Создание UI-компонентов

**Пример кнопки:**
```tsx
// components/ui/button.tsx
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
    >
      <Text className="text-white font-semibold">{title}</Text>
    </Pressable>
  );
}
```

**Использование:**
```tsx
import { Button } from '@/components/ui';

<Button title="Войти" onPress={() => router.push('/profile')} />
```

## Полезные советы

### 1. Всегда используйте SafeAreaView
```tsx
<SafeAreaView className="flex-1">
  {/* Ваш контент */}
</SafeAreaView>
```

### 2. Весь текст в <Text>
```tsx
// ❌ Неправильно
<View>Hello</View>

// ✅ Правильно
<View><Text>Hello</Text></View>
```

### 3. Flexbox по умолчанию
В React Native все контейнеры используют `flexbox` по умолчанию:
```tsx
<View className="flex-1">  {/* flex: 1 - занимает всё доступное пространство */}
```

### 4. Обработка клика
```tsx
// ❌ НЕТ onClick
<View onClick={...}>

// ✅ Используйте Pressable
<Pressable onPress={...}>
```

### 5. Навигация
```tsx
import { router } from 'expo-router';

// Переход
router.push('/screen');

// С параметрами
router.push({ pathname: '/user', params: { id: '123' } });

// В компоненте получаем параметры
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams();
```

## Следующие шаги

1. **Создайте экраны** в папке `app/`
2. **Создайте UI-компоненты** в `components/ui/`
3. **Добавьте хуки** для логики в `hooks/`
4. **Используйте TypeScript** для типизации
5. **Следуйте паттерну Smart/Dumb компонентов:**
   - Smart (экраны) — содержат логику и state
   - Dumb (UI) — только отображение, получают props

## Пример создания экрана

```tsx
// app/expenses.tsx
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { Button, Card } from '@/components/ui';
import { router } from 'expo-router';

interface Expense {
  id: string;
  title: string;
  amount: number;
}

export default function ExpensesScreen() {
  const expenses: Expense[] = [
    { id: '1', title: 'Продукты', amount: 1500 },
    { id: '2', title: 'Транспорт', amount: 500 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Расходы</Text>
        
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Text className="text-lg font-semibold">{item.title}</Text>
              <Text className="text-gray-600">{item.amount} ₽</Text>
            </Card>
          )}
        />
        
        <Button 
          title="Добавить расход" 
          onPress={() => router.push('/add-expense')}
        />
      </View>
    </SafeAreaView>
  );
}
```

## Отличия от Web

| Концепция | Web | React Native |
|-----------|-----|--------------|
| **Разметка** | HTML (`<div>`, `<span>`) | Components (`<View>`, `<Text>`) |
| **Стили** | CSS файлы | StyleSheet или NativeWind |
| **Клик** | `onClick` | `onPress` |
| **Навигация** | `<a href>` | `router.push()` |
| **Формы** | `<form>`, `<input>` | `<TextInput>` |
| **Изображения** | `<img src>` | `<Image source>` |
| **Скролл** | Автоматический | `<ScrollView>` |

---

**Готово!** Теперь у вас есть чистая база для разработки.
