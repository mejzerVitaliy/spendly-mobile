# Быстрая шпаргалка React Native + Expo Router

## 🎯 Три главных правила

1. **Весь текст только в `<Text>`**
   ```tsx
   ❌ <View>Hello</View>
   ✅ <View><Text>Hello</Text></View>
   ```

2. **Нет HTML — только React Native компоненты**
   ```tsx
   ❌ <div>, <span>, <button>
   ✅ <View>, <Text>, <Pressable>
   ```

3. **Используйте SafeAreaView для экранов**
   ```tsx
   <SafeAreaView className="flex-1">
     {/* Ваш контент */}
   </SafeAreaView>
   ```

---

## 📦 Основные компоненты

```tsx
import { 
  View,        // Контейнер (как <div>)
  Text,        // Текст (ОБЯЗАТЕЛЕН!)
  Pressable,   // Кликабельный элемент
  ScrollView,  // Прокрутка
  FlatList,    // Список
  TextInput,   // Поле ввода
  Image,       // Изображение
  SafeAreaView // Безопасная область
} from 'react-native';
```

---

## 🧭 Навигация (Expo Router)

### Создать новый экран
```tsx
// app/profile.tsx
export default function ProfileScreen() {
  return <View><Text>Profile</Text></View>;
}
// Доступен по /profile
```

### Переход между экранами
```tsx
import { router } from 'expo-router';

router.push('/profile');           // Перейти
router.back();                     // Назад
router.replace('/login');          // Заменить
router.push({                      // С параметрами
  pathname: '/user',
  params: { id: '123' }
});
```

### Получить параметры
```tsx
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams();
```

---

## 🎨 Стилизация (NativeWind)

```tsx
// Flexbox (по умолчанию!)
<View className="flex-1 flex-row justify-center items-center">

// Размеры
<View className="w-full h-20 p-4 m-2">

// Цвета
<Text className="text-blue-500 bg-gray-100">

// Закругления
<View className="rounded-lg rounded-full">

// Gap (расстояние между элементами)
<View className="flex-row gap-3">
```

---

## 🔧 Layout файл (_layout.tsx)

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Профиль',
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}
```

**Опции экрана:**
- `headerShown: false` — скрыть заголовок
- `title: "..."` — текст заголовка
- `presentation: 'modal'` — модальное окно

---

## 🖱️ Обработка кликов

```tsx
<Pressable onPress={() => console.log('Clicked')}>
  <Text>Нажми меня</Text>
</Pressable>
```

**НЕТ** `onClick` в React Native!

---

## 📝 Формы

```tsx
import { useState } from 'react';
import { TextInput } from 'react-native';

const [text, setText] = useState('');

<TextInput
  value={text}
  onChangeText={setText}
  placeholder="Введите текст"
  className="border p-2 rounded"
/>
```

---

## 📋 Списки

### ScrollView (для малых списков)
```tsx
<ScrollView>
  {items.map(item => <Text key={item.id}>{item.name}</Text>)}
</ScrollView>
```

### FlatList (оптимизированный)
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
/>
```

---

## 🖼️ Изображения

```tsx
// Из интернета
<Image 
  source={{ uri: 'https://...' }}
  className="w-20 h-20"
/>

// Локальные
<Image 
  source={require('./assets/logo.png')}
  className="w-20 h-20"
/>
```

---

## 🎭 Создание компонента

```tsx
// components/ui/my-button.tsx
import { Pressable, Text } from 'react-native';

interface MyButtonProps {
  title: string;
  onPress: () => void;
}

export function MyButton({ title, onPress }: MyButtonProps) {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-blue-500 p-3 rounded"
    >
      <Text className="text-white">{title}</Text>
    </Pressable>
  );
}
```

**Использование:**
```tsx
import { MyButton } from '@/components/ui/my-button';

<MyButton title="Click" onPress={() => console.log('Hi')} />
```

---

## 🚀 Структура экрана

```tsx
import { SafeAreaView, ScrollView, View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold">Заголовок</Text>
          {/* Ваш контент */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## 🆚 Web vs React Native

| Web | React Native |
|-----|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<button>` | `<Pressable>` |
| `<input>` | `<TextInput>` |
| `<img>` | `<Image>` |
| `onClick` | `onPress` |
| CSS файлы | StyleSheet / NativeWind |
| `<a href>` | `router.push()` |
| Авто-скролл | `<ScrollView>` |

---

## 💡 Полезные хуки

```tsx
import { useState, useEffect } from 'react';

// State
const [count, setCount] = useState(0);

// Эффекты
useEffect(() => {
  console.log('Component mounted');
}, []);

// Параметры маршрута
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams();
```

---

## ✅ Чеклист для нового экрана

1. Создать файл в `app/` (например `app/profile.tsx`)
2. Использовать `SafeAreaView` как корневой элемент
3. Добавить `ScrollView` если нужна прокрутка
4. Весь текст обернуть в `<Text>`
5. Использовать NativeWind классы для стилей
6. Для навигации использовать `router.push()`

---

**Готово! 🎉 Теперь можете разрабатывать.**
