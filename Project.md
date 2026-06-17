# Spendly Mobile

React Native / Expo personal finance tracker. Tracks income and expenses across multiple wallets, visualises spending by category, and supports AI-powered transaction creation via text or voice.

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK ~54 / React Native 0.81.5 |
| Routing | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS for RN) + StyleSheet |
| State | Zustand v5 |
| Data fetching | TanStack React Query v5 + Axios |
| Forms | React Hook Form + Zod |
| Animations | React Native Reanimated v4 + Expo Haptics |
| Charts | react-native-gifted-charts |
| Bottom sheets | @gorhom/bottom-sheet v5 |
| Glass effects | expo-blur (BlurView) |
| Gradients | expo-linear-gradient |
| Icons | @expo/vector-icons (Ionicons) |
| Storage | Expo SecureStore (tokens) + AsyncStorage |
| Typography | Inter (via @expo-google-fonts/inter) |
| Audio | expo-av (voice transaction recording) |

## Design System

### Theme Architecture

Two-layer token system:
- **`src/shared/theme/tokens.ts`** — single source of truth, used in all `StyleSheet.create` and inline styles
- **`tailwind.config.js`** — mirrors `tokens.ts` values for NativeWind `className` usage

Import: `import { colors, borderRadius, spacing, typography } from '@/shared/theme'`

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `background` | `#080808` | Screen backgrounds |
| `foreground` | `#F2F2F2` | Body text |
| `card` | `#111111` | Card surfaces |
| `primary` | `#22D3EE` | Cyan — buttons, active states, accents |
| `primaryForeground` | `#080808` | Text on primary buttons |
| `secondary` | `#1A1A1A` | Secondary surfaces |
| `muted` | `#1C1C1C` | Skeleton / inactive backgrounds |
| `mutedForeground` | `#737373` | Placeholder, helper, subtitle text |
| `border` | `#262626` | Dividers, input borders |
| `input` | `#161616` | Input field backgrounds |
| `destructive` | `#EF4444` | Error / delete actions |
| `success` | `#22C55E` | Income amounts, success states |
| `warning` | `#EAB308` | Warning states |
| `info` | `#0EA5E9` | Informational accent |
| `glass.background` | `rgba(255,255,255,0.05)` | Glass card surfaces |
| `glass.border` | `rgba(255,255,255,0.08)` | Glass card borders |
| `glass.tint` | `systemUltraThinMaterialDark` | BlurView tint value |
| `glass.intensity` | `35` iOS / `55` Android | BlurView intensity |

### Glass Effect Pattern

iOS: real `BlurView` (UIVisualEffectView) + semi-transparent overlay.
Android: `BlurView` with RenderEffect (Android 12+) or solid fallback.

```tsx
// Standard glass background pattern:
<BlurView intensity={colors.glass.intensity} tint={colors.glass.tint} style={StyleSheet.absoluteFillObject} />
<View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background }]} />
```

Dedicated components: `GlassView` and `GlassCard` in `src/shared/ui/`.

### Other Tokens

```ts
borderRadius: { sm:6, md:10, lg:14, xl:18, '2xl':22, '3xl':28, full:9999 }
spacing:      { xs:4, sm:8, md:12, lg:16, xl:20, '2xl':24, '3xl':32 }
typography:   { xs:11, sm:13, base:15, lg:17, xl:20, '2xl':24, '3xl':30, '4xl':36 }
```

## Project Structure

```
spendly-mobile/
├── app/                         # Expo Router routes
│   ├── _layout.tsx              # Root layout — providers, auth guard, fonts
│   ├── (auth)/                  # Login / Register screens
│   ├── (onboarding)/            # Welcome, wallet, currency, categories steps
│   ├── (tabs)/                  # Main tab screens
│   │   ├── _layout.tsx          # Tab navigator — uses TabBarWithModal
│   │   ├── index.tsx            # Home
│   │   ├── analytics.tsx
│   │   ├── wallets.tsx
│   │   └── settings.tsx
│   └── settings/                # Settings sub-screens (stack)
├── src/
│   ├── features/                # Feature slices (FSD-like)
│   │   ├── auth/
│   │   ├── balance-view/        # Balance widget (total + per-period)
│   │   ├── balance-trend/       # Balance over time chart
│   │   ├── category-chart/      # Pie + bar charts by category
│   │   ├── charts/              # Cash-flow, income/expense ratio charts
│   │   ├── create-transaction/  # Manual form, TextAI, VoiceAI
│   │   ├── edit-transaction/    # Edit / delete existing transaction
│   │   ├── income-expense-trend/
│   │   ├── period-selector/     # Week / month / year / custom picker
│   │   ├── settings/            # Settings feature slices
│   │   ├── transaction-search/
│   │   └── transactions-list/   # Grouped, animated transaction list
│   ├── screens/                 # Screen-level components
│   │   ├── home/
│   │   ├── analytics/
│   │   ├── wallets/
│   │   ├── onboarding/
│   │   └── settings/            # + sub-screens: account, categories, currencies, support-about
│   ├── shared/
│   │   ├── constants/
│   │   ├── hooks/               # useAuth, useProfile, useCategories, useCurrencies, useWallets, etc.
│   │   ├── services/
│   │   │   ├── api/             # Axios modules: auth, wallet, transactions, reports, categories, currencies
│   │   │   └── storage/         # Token storage (SecureStore)
│   │   ├── stores/              # Zustand: auth, home, analytics, wallet, onboarding
│   │   ├── theme/               # tokens.ts + index.ts
│   │   ├── types/               # Transaction, Wallet, Category, Currency, Reports, Auth
│   │   ├── ui/                  # Shared UI component library (see below)
│   │   └── utils/               # Date helpers, formatCompact, getDateRangeForPeriod
│   └── widgets/
│       └── tab-bar-with-modal/  # Tab bar + transaction creation modal
├── tailwind.config.js           # NativeWind tokens (mirrors tokens.ts)
└── src/global.css               # Tailwind base directives
```

## Shared UI Components

| Component | File | Notes |
|---|---|---|
| Button | `button.tsx` | Primary / secondary / destructive variants |
| Input | `input.tsx` | Controlled text input with label + error |
| FormInput | `form-input.tsx` | RHF-wired Input |
| Badge | `badge.tsx` | |
| Card | `card.tsx` | |
| GlassView | `glass-view.tsx` | BlurView + overlay wrapper |
| GlassCard | `glass-card.tsx` | GlassView with border + borderRadius |
| BottomSheet | `bottom-sheet.tsx` | @gorhom/bottom-sheet wrapper with glass bg |
| SegmentedControl | `segmented-control.tsx` | |
| NumericKeyboard | `numeric-keyboard.tsx` | Custom number pad for transaction amounts |
| Separator | `separator.tsx` | |
| TabBar | `tab-bar.tsx` | Custom animated tab bar with glass bg + sliding indicator |
| SettingsItem | `settings-item.tsx` | Flat row with icon + chevron, bottom border |
| SettingsHeader | `settings-header.tsx` | |
| ConfirmDialog | `confirm-dialog.tsx` | |
| ToastConfig | `toast-config.tsx` | react-native-toast-message styles |
| TransactionForm | `transaction-form.tsx` | Shared form fields for create/edit |
| FormCategoryPicker | `form-category-picker.tsx` | |
| FormCurrencyPicker | `form-currency-picker.tsx` | |
| FormDatePicker | `form-date-picker.tsx` | |
| FormPicker | `form-picker.tsx` | |
| FormSwitch | `form-switch.tsx` | |
| FormWalletPicker | `form-wallet-picker.tsx` | |
| IconSwitch | `icon-switch.tsx` | |

## Navigation

```
Root Stack
├── (onboarding)  — Welcome → Wallet → Currency → Categories
├── (auth)        — Login / Register
└── (tabs)        — Bottom tab navigator (TabBarWithModal)
    ├── index      — Home (balance + transactions)
    ├── analytics  — Charts
    ├── wallets    — Wallet management
    └── settings   — Settings + sub-screens (stack)
```

**Tab bar** (`TabBarWithModal` widget):
- Custom animated bar with glass background (`BlurView` + `rgba(8,8,8,0.55)` overlay)
- Sliding cyan indicator (`INDICATOR_WIDTH = 32`) that follows active tab
- Tab buttons: scale + translateY + separate icon/text opacity animations via Reanimated
- Center "+" button: `AnimatedPressable` with scale + 90° rotate on press, cyan linear gradient
- Pressing "+" opens a modal with three animated options: **Manual**, **Text AI**, **Voice AI**
- Each option button has spring scale + opacity press animation

## AI Features

- **TextAI** — user types natural language (e.g. "spent 200 on coffee"); API calls OpenAI, returns structured transaction
- **VoiceAI** — user records audio via expo-av; sent to API for transcription + parsing via OpenAI

## State Management

Zustand stores:
- `useAuthStore` — user session, tokens
- `useHomeStore` — period type, current date, date range for home screen
- `useAnalyticsStore` — period type, date range for analytics
- `useWalletStore` — selected wallet
- `useOnboardingStore` — onboarding step state

## Dev Commands

```bash
npm start              # Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
```
