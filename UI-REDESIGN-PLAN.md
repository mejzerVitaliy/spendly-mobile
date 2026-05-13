# UI Redesign Plan: Black-Gray Theme + Liquid Glass

## 1. Liquid Glass на Android — исследование

### Что такое Liquid Glass
Liquid Glass — визуальный язык Apple, представленный на WWDC 2025 для iOS 26. В SwiftUI/UIKit это новый материал (`UIGlassEffect`) с преломлением, размытием и адаптивным свечением. В React Native нативный API iOS 26 (`UIGlassEffect`) **пока не доступен** через Expo (expo-blur v15, установленный в проекте, использует `UIVisualEffectView` — предшественника).

### Что возможно прямо сейчас

| Эффект | iOS | Android |
|---|---|---|
| Нативный UIGlassEffect (iOS 26) | Нет (нет моста в RN/Expo) | Нет |
| `BlurView` (expo-blur) | **Да** — аппаратное ускорение через `UIVisualEffectView` | **Да** — с Expo SDK 54 + RN 0.81 использует `RenderEffect` (Android 12+), аппаратное ускорение |
| Полупрозрачные стёкла через RGBA + размытие | **Да** — очень близко к Liquid Glass | **Да** — чуть ниже качество на Android < 12 |
| Градиентный блик (`expo-linear-gradient`) | **Да** | **Да** |
| Shimmer / refraction эффект | Через Skia | Через Skia |

### Вывод
Реализовать Liquid Glass **можно на обеих платформах**, используя `expo-blur` + `expo-linear-gradient` + полупрозрачные слои. Разница:
- **iOS** — высококачественный blur через `UIVisualEffectView`, ощущение нативного стекла
- **Android 12+** — `RenderEffect` hardware blur, очень близко к iOS
- **Android < 12** — software blur approximation, заметно хуже

**Рекомендуемый подход**: единый `GlassView` компонент с платформо-специфичными параметрами (`intensity`, `fallback`). Это лучше, чем полностью раздельные UI, т.к. код-база остаётся единой.

---

## 2. Новая цветовая тема (черно-серая)

### Текущая проблема
Токены частично в `tailwind.config.js`, частично хардкодом в `StyleSheet.create`. Это нужно исправить в рамках рефакторинга.

### Целевая палитра

```
// Основа — глубокий черный, нейтральные серые
background:         #080808   // почти черный
foreground:         #F0F0F0   // почти белый

card:               #111111   // темно-серый (поверхность карточек)
card-foreground:    #F0F0F0

// Glass поверхности (новые токены)
glass:              rgba(255,255,255,0.06)   // стекло — светлый оттенок
glass-border:       rgba(255,255,255,0.10)   // тонкая рамка стекла
glass-highlight:    rgba(255,255,255,0.15)   // блик сверху

primary:            #FFFFFF   // белый — основной акцент
primary-foreground: #080808

secondary:          #1A1A1A   // тёмная поверхность
secondary-foreground: #D0D0D0

muted:              #1C1C1C
muted-foreground:   #6B6B6B

border:             #2A2A2A
input:              #1A1A1A
ring:               rgba(255,255,255,0.3)

// Семантические (без изменений)
destructive:        #EF4444
destructive-foreground: #FFFFFF
success:            #22C55E
success-foreground: #FFFFFF
warning:            #EAB308
warning-foreground: #000000
info:               #0EA5E9
info-foreground:    #FFFFFF

// Акцент для центральной кнопки и активных элементов
accent:             #E0E0E0   // светло-серый
accent-foreground:  #080808
```

---

## 3. Архитектура: централизация UI-системы

### 3.1 Текущие проблемы

1. **Хардкодные цвета в StyleSheet.create** — найдены в:
   - `src/shared/ui/tab-bar.tsx` — `#1F2937`, `#374151`, `#8B5CF6`, `#9CA3AF`, `#FFFFFF`
   - `src/shared/ui/bottom-sheet.tsx` — `#111827`, `#D1D5DB`
   - `src/widgets/tab-bar-with-modal/tab-bar-with-modal.tsx` — `#8B5CF6`, `#10B981`, `#F97316`, `#FFFFFF`
   - `src/shared/ui/input.tsx` — `#64748b` (placeholderTextColor)
   - `src/shared/ui/button.tsx` — `#0f172a` (ActivityIndicator color)

2. **Дублирование** — `global.css` определяет CSS-переменные, которые не используются (NativeWind в RN не читает CSS vars так, как в вебе)

3. **Нет единого источника правды для платформо-специфичных значений** — iOS/Android blur, радиусы, тени

### 3.2 Целевая структура

```
src/shared/
├── theme/                          # НОВАЯ ПАПКА — единый источник правды
│   ├── tokens.ts                   # Все цвета, типографика, радиусы как JS-константы
│   ├── colors.ts                   # Экспорт для использования в StyleSheet
│   └── index.ts
├── ui/
│   ├── glass-view.tsx              # НОВЫЙ — Glass/blur контейнер
│   ├── glass-card.tsx              # НОВЫЙ — Карточка с Glass эффектом
│   ├── glass-bottom-sheet.tsx      # НОВЫЙ — BottomSheet с glass фоном
│   ... (существующие компоненты)
```

**`src/shared/theme/tokens.ts`** — пример структуры:
```typescript
import { Platform } from 'react-native';

export const colors = {
  background: '#080808',
  foreground: '#F0F0F0',
  card: '#111111',
  // ... все токены
  glass: {
    background: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.10)',
    highlight: 'rgba(255,255,255,0.15)',
    tint: 'systemUltraThinMaterialDark' as const, // для expo-blur на iOS
    intensity: Platform.OS === 'ios' ? 40 : 60,   // разные значения под платформу
  },
} as const;
```

---

## 4. Компонент GlassView — ключевой строительный блок

```
src/shared/ui/glass-view.tsx
```

Этот компонент заменит простой `<View>` там, где нужен glass-эффект.

**Логика:**
```typescript
// iOS:   BlurView (UIVisualEffectView) + полупрозрачный оверлей + border
// Android 12+: BlurView (RenderEffect) + полупрозрачный оверлей + border  
// Android < 12: полупрозрачный тёмный фон + border (fallback)
```

**API:**
```typescript
<GlassView
  intensity={40}          // сила blur (0-100)
  tint="dark"             // 'dark' | 'light' | 'default'
  borderRadius={16}
  border                  // показать glass border
  highlight               // добавить белый блик сверху
>
  {children}
</GlassView>
```

---

## 5. Пошаговый план реализации

### Шаг 1 — Централизация токенов
**Файлы:** `tailwind.config.js`, `src/shared/theme/tokens.ts` (новый)

- Обновить цвета в `tailwind.config.js` на черно-серую палитру (новые значения из §2)
- Добавить токены `glass` и `glass-border` в Tailwind для использования через className
- Создать `src/shared/theme/tokens.ts` с теми же значениями для использования в `StyleSheet.create`
- Удалить содержимое `global.css` (CSS vars не используются, только мешают)

**Результат:** Единый источник правды. Все компоненты читают одни и те же значения.

---

### Шаг 2 — Создать GlassView и GlassCard
**Файлы:** `src/shared/ui/glass-view.tsx` (новый), `src/shared/ui/glass-card.tsx` (новый)

`GlassView`:
- Использует `BlurView` из `expo-blur` с `Platform.select` для параметров
- Добавляет полупрозрачный оверлей (`glass.background`)
- Опциональная `glass.border` рамка (тонкая белая)
- Опциональный `glass.highlight` (LinearGradient белый блик сверху)
- На Android < 12 — fallback к `rgba(20,20,20,0.85)` без blur

`GlassCard`:
- Тонкая обёртка над `GlassView` с padding и borderRadius из токенов
- Заменяет существующий `Card` в компонентах, где нужен glass-стиль

---

### Шаг 3 — Перевести Tab Bar
**Файл:** `src/shared/ui/tab-bar.tsx`

- Заменить `backgroundColor: '#1F2937'` на `GlassView` с blur
- Убрать `borderTopWidth / borderTopColor` — заменить на `glass.border`
- Цвет активной иконки: `colors.foreground` (белый)
- Цвет неактивной иконки: `colors.muted.foreground`
- Индикатор: белая полоска вместо пурпурной
- Центральная кнопка: `LinearGradient` от `#2A2A2A` → `#1A1A1A` (или `#3A3A3A` → `#1A1A1A`) вместо фиолетового
- iOS: тень центральной кнопки белая/серая вместо `#8B5CF6`
- Android: elevation без цвета тени

---

### Шаг 4 — Перевести BottomSheet
**Файл:** `src/shared/ui/bottom-sheet.tsx`

- `bottomSheetBackground.backgroundColor`: заменить `#111827` → использовать `colors.card` (`#111111`)
- Для iOS: можно использовать `BlurView` через кастомный `backgroundComponent` в `BottomSheetModal`
- `handleIndicator.backgroundColor`: `rgba(255,255,255,0.2)` вместо `#D1D5DB`

---

### Шаг 5 — Перевести TabBarWithModal (меню создания транзакции)
**Файл:** `src/widgets/tab-bar-with-modal/tab-bar-with-modal.tsx`

- **iOS**: уже использует `BlurView` — хорошо. Только обновить `intensity` и `tint`
- **Android**: заменить `rgba(0,0,0,0.75)` на `GlassView` с blur (если Android 12+) либо оставить как fallback
- Кнопки меню (`MENU_ITEMS`): сохранить семантические цвета (зелёный для TextAI, оранжевый для VoiceAI) — они выполняют функцию идентификации, убирать не нужно. Фон кнопки — `GlassView` вместо цветного oверлея `${color}20`

---

### Шаг 6 — Перевести существующие компоненты
**Компоненты с хардкодными цветами:**

| Файл | Что исправить |
|---|---|
| `button.tsx` | ActivityIndicator color → `colors.foreground` / `colors.background` |
| `input.tsx` | `placeholderTextColor` → `colors.muted.foreground` |
| `settings-item.tsx` | icon color `#64748b` → `colors.muted.foreground` |
| `settings-header.tsx` | icon color `#64748b` → `colors.muted.foreground` |

---

### Шаг 7 — Glass-эффект для карточек и экранов
**Применить GlassCard вместо Card в:**

- `BalanceView` — главный виджет баланса
- Карточки в `WalletsScreen`
- Карточки в `AnalyticsScreen`
- `BottomSheet` формы создания/редактирования транзакции

**Применить GlassView для:**
- Заголовков экранов (settings header)
- Фона `SegmentedControl` (сейчас `bg-muted` — заменить на glass)
- `PeriodSelector` контейнер

---

### Шаг 8 — Убрать global.css или синхронизировать
**Файл:** `src/global.css`

Вариант A (рекомендуется): Оставить только Tailwind directives, убрать CSS vars (они не работают в RN).
Вариант B: Оставить для потенциального веб-таргета (expo web).

---

## 6. Итоговая структура изменений

```
ИЗМЕНИТЬ:
  tailwind.config.js              → новая черно-серая палитра + glass токены
  src/global.css                  → убрать неиспользуемые CSS vars
  src/shared/ui/tab-bar.tsx       → glass tab bar, новые цвета
  src/shared/ui/bottom-sheet.tsx  → токены вместо хардкода
  src/shared/ui/button.tsx        → токены для ActivityIndicator
  src/shared/ui/input.tsx         → токен для placeholder
  src/shared/ui/settings-item.tsx → токен для icon color
  src/shared/ui/settings-header.tsx → токен для icon color
  src/widgets/tab-bar-with-modal/tab-bar-with-modal.tsx → GlassView для Android

СОЗДАТЬ:
  src/shared/theme/tokens.ts      → JS-константы всех токенов
  src/shared/theme/index.ts       → re-export
  src/shared/ui/glass-view.tsx    → BlurView wrapper (iOS + Android)
  src/shared/ui/glass-card.tsx    → Glass-карточка
```

---

## 7. Ожидаемый визуальный результат

| Элемент | До | После |
|---|---|---|
| Фон экранов | Тёмно-фиолетовый `#0C0516` | Глубокий чёрный `#080808` |
| Карточки | Тёмно-фиолетовый `#1B0642` | Frosted glass поверх чёрного |
| Tab bar | Серый `#1F2937` + пурпурный акцент | Glass + белый акцент |
| Центральная кнопка "+" | Фиолетовый градиент | Тёмно-серый/белый градиент |
| Bottom sheet | `#111827` | Glass / тёмный charcoal |
| Primary colour | Фиолетовый `#977DFF` | Белый / светло-серый |
| BottomSheet рукоятка | Серая `#D1D5DB` | `rgba(255,255,255,0.2)` |

---

## 8. Примечания по платформам

### iOS
- `BlurView` с `tint="systemUltraThinMaterialDark"` даёт наиболее нативный glass-эффект
- `shadowColor` теней → менять на белый/серый, не фиолетовый
- Можно добавить `shadowOpacity: 0.15` для стеклянного свечения

### Android
- `BlurView` работает аппаратно на Android 12+ (API 31+)
- На Android < 12 — `GlassView` автоматически падает на `rgba(14,14,14,0.9)` + border
- `elevation` вместо `shadow*` — оставить как есть (это правильно)
- Tab bar: на Android glass-эффект будет чуть менее выраженным, но сохранит тот же дизайн-язык
