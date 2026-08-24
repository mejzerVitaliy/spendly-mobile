# Store Metadata — Spendly AI

Working doc for App Store Connect + Google Play Console submission. Copy blocks are ready to paste; screenshot sections are a step-by-step for you to execute (screenshots need to come from you — see why in that section).

## App identity (both stores)

| Field | Value |
|---|---|
| App name | Spendly AI |
| iOS bundle ID | `com.spendlyai.app` |
| Android package | `com.spendlyai.app` |
| Version | 1.0.0 |
| Primary category | Finance |
| Tablet support | None — phone only (`supportsTablet` set to `false`) |
| Support email | support@spendly-ai.com |
| Support / Marketing URL | https://spendly-ai.com |
| Privacy Policy | https://spendly-ai.com/privacy |
| Terms of Use | https://spendly-ai.com/terms |

---

## App Store Connect (Apple)

### Name (30 char max)
```
Spendly AI
```
Kept as the plain brand name for consistency with the in-app header and icon. Keyword content goes in the subtitle field instead — Apple indexes both, no need to cram keywords into the name.

### Subtitle (30 char max)
```
AI Expense & Budget Tracker
```

### Promotional text (170 char max — editable anytime without a review)
```
Type it or say it — Spendly's AI turns a sentence into a categorized transaction in seconds. Multi-wallet, multi-currency, real insights.
```

### Description (4000 char max)
```
Spendly AI turns the tedious parts of tracking your money into a two-second habit. Type what you spent in plain language, or just say it out loud — Spendly's AI turns it into a categorized transaction instantly.

TRACK MONEY YOUR WAY
• Type it: "spent 25 on groceries" becomes a categorized transaction automatically
• Say it: record a voice note and Spendly transcribes and creates the transaction for you
• Or add it manually, your choice every time

SEE WHERE IT GOES
• Visual breakdowns of spending by category, week, month or year
• Income vs. expense trends over time
• AI Coach — plain-language insights on your spending and savings, not just charts
• Multiple wallets — cards, cash, savings — tracked separately and together

STAY ON TOP OF IT
• Weekly summaries and monthly recaps
• Spending-trend and category-insight notifications
• Recurring transactions tracked automatically

BUILT FOR HOW YOU ACTUALLY SPEND
• Multi-currency support
• Clean, fast, distraction-free interface
• Your data, your control — delete your account and data anytime, in-app

Spendly AI — the fastest way to know where your money went.
```

### Keywords (100 char max, comma-separated, no spaces after commas)
```
budget,expense tracker,money manager,finance,ai assistant,voice input,wallet,spending,savings
```
93/100 characters — don't repeat words already in the name/subtitle ("Spendly", "AI", "tracker" are already indexed from those fields per Apple's own guidance).

### Age rating
Run the questionnaire in App Store Connect answering "None/No" to every content-descriptor question (no violence, no mature content, no gambling, no user-generated public content, no unrestricted web access). That lands at **4+**.

---

## Google Play Console

Play has no separate keywords field — discovery comes from the title + descriptions, which is why the keyword terms above are already woven into the description text below rather than listed separately.

### App name (30 char max)
```
Spendly AI
```

### Short description (80 char max)
```
Track spending by text or voice — AI-powered budget and wallet tracker.
```

### Full description (4000 char max)
Same copy as the App Store description above — identical listing text across both stores is standard practice, no need to rewrite it.

### Category
Finance

### Content rating (IARC questionnaire)
Same logic as Apple's: answer "No" throughout (no violence/gambling/user-generated public content). Lands at **Everyone / PEGI 3**.

### Data safety section
See the cheat sheet below — it maps directly onto Play's Data safety form fields.

---

## Privacy questionnaire cheat sheet (App Privacy + Data safety)

Based on what the code actually does today (checked both repos while writing this) — verify against your live production config before submitting, since this reflects the code, not your infra settings:

**Data collected:**
| Category | What | Why |
|---|---|---|
| Contact info | Email address | Account creation/login |
| Financial info | Transaction amounts, categories, wallet balances, currency | Core app function — user-entered |
| User content | Typed transaction text; voice recordings | AI parsing (text) / transcription (voice) |
| Identifiers | Auth token (device-local, SecureStore) | Session |
| App activity | Custom in-app event tracking | First-party analytics, sent to Spendly's own backend |
| Diagnostics | Crash logs | Firebase Crashlytics — **production builds only** |

**Not collected:** location, contacts, photos/camera, browsing history, advertising identifiers. No third-party analytics SDK is used (the in-app analytics is custom, hits your own `/analytics/event` endpoint — not Firebase Analytics, Meta, etc.).

**Shared with third parties:**
- **OpenAI** — receives typed transaction text and voice audio for AI parsing/transcription. Voice audio is sent in-memory and discarded after transcription; Spendly's backend never writes it to disk or a database. Check your OpenAI account's data-retention setting before answering "how long is this data retained" in the forms.
- **Google (Firebase Crashlytics)** — crash diagnostics, production builds only.

**Encryption in transit:** assumed yes (HTTPS) — confirm the production API is actually served over TLS before ticking that box.

**Data deletion:** Yes — in-app account deletion is implemented on both the mobile app and the backend.

---

## Screenshots

### Which screens to capture

Shoot in this order — it reads as a story (hero → the AI hook → the depth) and Apple/Play both show screenshot #1 in search results before anyone taps into the listing, so lead with your strongest:

1. **Home** — balance overview + recent transactions. The "here's what you get" screen.
2. **AI text input** — the create-transaction screen mid-flow, typing a natural-language entry (e.g. "spent 25 on groceries"). This is the single most differentiating feature — sell it first.
3. **Voice AI** — the voice-recording screen. Second half of the same pitch.
4. **Analytics** — the charts screen with a populated category breakdown.
5. **Wallets** — the multi-wallet list.

Before shooting, **seed the guest/test account with realistic data** — a few wallets, a week or two of varied transactions across categories. An empty "No transactions for this period" state looks bad in a store listing. Skip demo/lorem text; use plausible amounts and category names.

### Status — 2026-08-24, second pass done

First batch had thin data (no expenses anywhere). A second round added a rent expense, a second wallet (EUR savings), which fixed both gaps flagged below. Final 6 screenshots live in [`store-assets/screenshots/ios-6.9/`](store-assets/screenshots/ios-6.9/), all at the correct 1320×2868, all ready to upload as-is:

| # | File | What it shows |
|---|---|---|
| 1 | `01-home.png` | $4.1K balance, income $2.6K / expenses $700 — both sides populated now (Rent, Bonus, Salary transactions visible). |
| 2 | `02-ai-text.png` | "Review transactions" confirmation screen — AI parsed "Got 2k usd salary and five hundred euro bonus" into 2 categorized transactions with EUR→USD auto-conversion. Shows the AI feature actually working, not just an input box. |
| 3 | `03-voice-ai.png` | Clean idle "Tap to start recording" state. |
| 4 | `04-analytics.png` | Charts tab — Cash Flow Trend (income vs. expense lines) + 79%/21% income/expense split. Real spending data now, not a flat 100/0. |
| 5 | `05-ai-insights.png` | Analytics → Insights tab ("AI Coach": Positive Cash Flow, Great Savings Rate, Strong Income Month). Not in the description copy — see suggestion below. |
| 6 | `06-wallets.png` | 2 wallets — Main Wallet (Cash, $2.9K) + Savings EUR (€1.0K ≈ $1.2K), multi-currency conversion visible. |

Went from 5 planned screens to 6 — both the plain charts tab and the AI-insights tab turned out strong enough to use rather than picking one, and Apple/Play both allow well past 6 (10 and 8 respectively).

**Copy updated** — AI Coach is now a bullet under "SEE WHERE IT GOES" in both the EN and RU description blocks above.

**Ready to submit** — pending your review of the RU copy and the actual upload/questionnaires in each console.

### iOS sizes and how to get them

Apple currently requires one screenshot set at the **6.9" display class** (iPhone 16/17 Pro Max) — App Store Connect auto-generates the smaller device sizes from it, so you don't need to shoot every size separately. Target resolution: **1320 × 2868px portrait**.

To get a Pro Max simulator running (you're currently on a plain "iPhone 17 Pro", which is a smaller display class than what's required):

```bash
# see what's installed
xcrun simctl list devicetypes | grep -i "pro max"

# create + boot a Pro Max simulator if you don't have one yet
xcrun simctl create "iPhone 17 Pro Max" "iPhone 17 Pro Max"
xcrun simctl boot "iPhone 17 Pro Max"
open -a Simulator
```

Or via the GUI: in **Simulator.app → File → Open Simulator → iOS \<version\> → iPhone 17 Pro Max**.

Once it's booted and the app is running on it, capture each screen with **Cmd+S** in Simulator (saves a full-resolution PNG straight to your Desktop, already at the correct pixel size — no cropping needed).

### Android sizes and how to get them

Play is less strict about exact dimensions than Apple (accepts anywhere from 320px to 3840px on a side, 16:9–9:16 ratio), but screenshots should genuinely come from an Android build, not a resized iOS capture — reviewers do notice iOS status bars/notches in a Play listing.

**This Mac doesn't have the Android emulator installed** (checked — no Android SDK under `~/Library/Android/sdk`), so Android screenshots aren't something I can generate in this session. Two options:
- Install Android Studio (brings the emulator + SDK), boot a Pixel-class AVD, run `npm run android`, capture via the emulator's camera-icon screenshot button.
- Shoot on a real Android phone via `expo run:android --device` or a dev build.

Also required for Play (separate from screenshots): a **1024×500 feature graphic** — a branded promo banner, not a screenshot. That's a small design task (I can put one together the same way the app icon was generated — headless-Chrome-rendered SVG — if you want; just say so when you're ready for it).

### Minimums
- Apple: at least 3 screenshots per required size class (up to 10 allowed).
- Play: minimum 2 phone screenshots, up to 8.

The final 6-screen set (see Status above) covers both comfortably.

---

## Russian localization (optional, both stores)

The app itself ships English + Russian (`LANGUAGES = ['en', 'ru']`), so it's worth adding a Russian store listing alongside the English one — both stores support multiple listing languages under the same app, App Store Connect via additional localizations in App Information, Play via "Manage translations" in the main store listing. Not required to launch; add whenever convenient.

### Name / Subtitle (App Store)
```
Spendly AI
Бюджет и расходы с ИИ
```

### Description (both stores)
```
Spendly AI превращает рутинный учёт денег в привычку на две секунды. Опишите трату обычными словами или просто скажите вслух — ИИ сам создаст транзакцию с нужной категорией.

ВЕДИТЕ УЧЁТ УДОБНО
• Текстом: «потратил 500 на продукты» становится готовой транзакцией
• Голосом: запишите голосовую заметку — Spendly распознает речь и создаст транзакцию
• Вручную — как вам удобнее в моменте

ВИДЬТЕ, КУДА УХОДЯТ ДЕНЬГИ
• Наглядная разбивка расходов по категориям, неделям, месяцам и годам
• Динамика доходов и расходов
• AI Coach — простым языком о ваших тратах и накоплениях, а не только графики
• Несколько кошельков — карты, наличные, накопления — отдельно и вместе

ДЕРЖИТЕ РУКУ НА ПУЛЬСЕ
• Еженедельные и ежемесячные сводки
• Уведомления о трендах трат и инсайтах по категориям
• Регулярные операции учитываются автоматически

ПОД ВАШИ ПРИВЫЧКИ
• Поддержка нескольких валют
• Быстрый, чистый интерфейс без лишнего
• Ваши данные под вашим контролем: аккаунт и данные можно удалить в любой момент прямо в приложении

Spendly AI — самый быстрый способ понимать, куда уходят ваши деньги.
```

### Promotional text (App Store)
```
Опишите трату словами или голосом — ИИ сам создаст транзакцию за секунды. Несколько кошельков, валют и реальная аналитика.
```

### Short description (Google Play, 80 char max)
```
Учёт трат текстом или голосом — бюджет и кошельки с ИИ.
```

### Keywords (App Store)
```
бюджет,учет расходов,финансы,трекер трат,ии помощник,кошелек,экономия,накопления,голосовой ввод
```
