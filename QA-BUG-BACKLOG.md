# QA Bug Backlog — 2026-09-13

**Update 2026-09-13:** all three P0 items, and P1 #4/#5/#6/#7/#8, and P2 #9/#10/#12, plus two of the four feature requests, are now fixed in code — see each item's "Status" line. Nothing deployed or run on-device yet; that's the next step on your side.

Findings from ~2 weeks of dogfooding (daily real transactions, logout/login cycles, AI text & voice entry). Root causes below were traced in code, not guessed — file:line refs point at the actual bug where one was found. Items without a confirmed root cause are marked "not yet traced."

Repo note: this app is `spendly-mobile`; backend fixes below live in the sibling `spendly-api` repo (paths noted explicitly).

---

## P0 — Core feature / data integrity

### 1. AI transaction creation is unreliable ("works one day, fails the next")
`spendly-api/src/bootstrap/openai.ts`

Three compounding issues, all confirmed in code:

- **No logging on parse failure.** `parseTransaction()` (openai.ts:164-173) catches JSON-parse/Zod-validation errors and returns a generic `{ success: false, error: 'Failed to parse AI response' }` — the raw model output is discarded, never logged. This is exactly why the error can't be found in OpenAI logs or reproduced: the evidence is thrown away server-side before it reaches any log.
- **Loose JSON mode, not strict schema.** `response_format: { type: 'json_object' }` (openai.ts:143) only guarantees syntactically valid JSON, not that it matches `parsedTransactionItemSchema`. gpt-4o-mini occasionally omits a field or returns a slightly-off shape under this mode, which throws in the Zod `.parse()` right after. OpenAI's stricter Structured Outputs (`response_format: { type: 'json_schema', json_schema: { strict: true, schema: ... } }`) guarantees schema conformance and would remove this failure class entirely.
- **No retry/timeout around the OpenAI calls.** Neither `parseTransaction` nor `transcribeAudio` (openai.ts:136-192) has retry/backoff or an explicit timeout. A transient 429/5xx from OpenAI (common under shared capacity) surfaces immediately as a user-facing error instead of a retried request. This is also the main lever for "make it faster" — a timeout + one fast retry beats a hung request.

**Fix order:** (1) log raw model output + Zod error on every failure — needed before any prompt tuning, since right now there's no visibility into what's actually going wrong; (2) switch to strict Structured Outputs; (3) add retry-with-backoff + a request timeout.

**Status: done in code.** `openai.ts` now uses `response_format: json_schema` with `strict: true` (schema hand-mirrors `parseTransactionResponseSchema`), sets a 20s timeout on the parse call / 30s on transcription, retries the parse once on any failure, and logs the raw model content + error on every failed attempt via `console.error` (shows up in Cloud Run/Cloud Logging). Note: the OpenAI SDK already retries transient network/5xx/429 errors twice by default (`maxRetries: 2`) — the added app-level retry specifically covers "got a 200 but the content didn't validate," which the SDK-level retry doesn't touch. Not yet validated against a real intermittent failure in production — worth watching logs after deploy to confirm failures are now visible and rarer.

### 2. Recurring transactions depend on a cron job that likely never runs
`spendly-api/src/business/services/cron/recurring.cron.ts`, `spendly-api/cloudbuild.yaml`

(Notifications are **not** affected by this one — they're a separate, fully client-side system with no server cron involved at all. See #4a below.)

- `startRecurringCron()` schedules an **in-process** `node-cron` job at `5 0 * * *` (recurring.cron.ts:9), started from `src/index.ts:83`.
- The API is deployed to Cloud Run with `--min-instances=0` (cloudbuild.yaml) — it scales to zero when idle. `node-cron` only fires if the process happens to be alive at 00:05; with no traffic at that hour the container is asleep and the job silently never runs.
- There is already a **correctly-built alternative**: `POST /cron/recurring` (`spendly-api/src/routes/cron/cron.route.ts`), authenticated via a `CRON_SECRET` (already provisioned in Secret Manager, referenced in cloudbuild.yaml) — exactly the shape of endpoint you'd wire to Google Cloud Scheduler to wake the service and run the job reliably. Nothing found in this repo suggests a Cloud Scheduler job actually calls it.

**This confirms your suspicion exactly.** Recurring transactions are processed by this same job (`transactionService.processAllRecurringDue()`), so they're exposed to the same silent-skip risk.

**Fix:** create a Cloud Scheduler job hitting `POST /cron/recurring` with the `CRON_SECRET`, then delete `startRecurringCron`/`node-cron` entirely — keeping both risks double-processing (duplicate recurring transactions) on the rare tick where the container happens to be warm at 00:05.

**Status: done in code, needs one manual GCP step before it's live.** Removed `startRecurringCron`/`recurring.cron.ts` and the `node-cron`/`@types/node-cron` dependency entirely. Added a `ScheduleRecurringCron` step to `cloudbuild.yaml` that creates (or updates, idempotently) a Cloud Scheduler job `spendly-recurring-cron` hitting `POST /cron/recurring` with the `Authorization: Bearer <CRON_SECRET>` header, daily at `5 0 * * *` UTC — same schedule the old in-process job used.

Before the next deploy actually wires this up, someone with project access needs to, once:
1. Enable the Cloud Scheduler API on the project (`gcloud services enable cloudscheduler.googleapis.com --project=tokyo-hydra-464314-a0`), if not already on.
2. Grant `roles/cloudscheduler.admin` to the deploy trigger's actual service account — confirmed to be `dev-cloud-build-sa@tokyo-hydra-464314-a0.iam.gserviceaccount.com` (a custom SA, not the legacy default), not Scheduler by default.

I didn't run any live `gcloud`/IAM commands myself — that's a one-time change to your actual GCP project, not something to do without you looking at it first. In progress as of 2026-09-13 — pending confirmation the IAM grant went through and a deploy has run with the new step.

### 3. False "limits exceeded" alert blocks the whole app
`spendly-mobile/src/shared/services/api/api.ts:69-92`, `spendly-api/src/index.ts:40-44`

The axios response interceptor shows a blocking `Alert.alert("limits reached")` for **any HTTP 429**, no matter which of two unrelated things caused it:

- `spendly-api/src/business/lib/errors/index.ts:14` — `LimitReachedError` (your actual monthly AI quota, 30 tx / 5 insights) → 429.
- `spendly-api/src/index.ts:40-44` — a **global** `@fastify/rate-limit` (100 req/min, keyed by IP by default) → also 429, for completely unrelated reasons (e.g. a burst of parallel requests on app open/pull-to-refresh, especially if a shared/carrier IP is involved).

The client can't tell these apart because it only checks the status code. That's exactly consistent with what you saw: an AI-quota message while nowhere near the monthly AI limit — you almost certainly tripped the generic per-IP rate limit, not the usage quota.

There's a second bug in the same block: `limitAlertVisible` (api.ts:10) is a plain module-level boolean, reset only inside the Alert's button callbacks. Dismissing the native alert via the OS back gesture/button (no callback fires) leaves it `true` forever for the rest of the session, silently swallowing every subsequent 429 with no feedback at all until the app restarts — which matches "kept happening until I reopened the app."

**Fix:** have the client branch on the error body's `code` (`LIMIT_REACHED` vs Fastify's generic rate-limit shape), not the bare status; key the rate limiter per authenticated user instead of per-IP; reset `limitAlertVisible` unconditionally (e.g. in `Alert.alert`'s `onDismiss`, or better, track it in a store instead of a module-level boolean).

**Status: done in code.** Server: `fastifyRateLimit` now keys by decoded (unverified — just reading the `userId` claim, real auth still happens downstream) JWT user id when a bearer token is present, falling back to IP only for unauthenticated requests — a shared/NAT'd IP no longer pools unrelated users into one bucket. Client: the interceptor now only shows the "limits reached" alert when `error.response.data.code === 'LIMIT_REACHED'`; a generic rate-limit 429 (no `code`) is rejected silently instead of showing a misleading message. The stuck-flag bug is fixed with a 60s safety-net timer plus `Alert.alert`'s `onDismiss`, so a missed dismissal path can no longer permanently swallow future 429 alerts for the rest of the session.

---

## P1 — High-visibility, hits most sessions

### 4. Notification spam before login / during onboarding, and history wiped on every re-login
`spendly-mobile/app/_layout.tsx:104-134`, `src/shared/hooks/auth/use-auth.ts:21-37`, `src/shared/services/api/api.ts:147-150`

One root cause explains three of your reports (spam in onboarding, push/in-app mismatch's timing, and history disappearing after re-login):

- The notification-sync effect (`_layout.tsx:104-109`) runs on `[isLoading, isMounted, t, router]` — **not gated on `isAuthenticated`**, so it fires during onboarding and while logged out, exactly as you saw.
- `t` and `router` are unstable references that change across re-renders/navigations, so this effect re-fires more often than "once per app open."
- `clearLocalAccountState()` (use-auth.ts:30-36) — called on every explicit logout **and** on every failed token refresh (api.ts:147-150) — calls `useNotificationsStore.getState().reset()`, which wipes `notifications` (the in-app history) **and** every per-type `cooldown` in one shot.

Put together: every logout instantly clears all cooldowns, and the very next `syncOnAppOpen()` (which, per the first bug, can run before you're even logged back in) re-evaluates "is it Sunday → weekly summary due" etc. with a clean slate and fires again. If the effect re-runs multiple times off the unstable deps before you finish onboarding, you get exactly the repeated bursts you saw.

The history wipe (separate symptom, same call) is a design choice — `clearLocalAccountState` intentionally clears local state on logout so a shared/handed-down device can't leak one account's data to the next login — but it's local-only (AsyncStorage), never synced to the backend, so it also wipes the *same* user's own history when they log back in on their own device.

**Fix:** gate the sync effect on `isAuthenticated`; drop `t`/`router` from its deps (use stable refs or an empty-dep mount effect); and stop conflating "wipe on account switch" with "wipe on this same user's normal logout" — either persist notification history/cooldowns server-side per user, or only wipe them when the *next* login is a different user id than the one that logged out.

**Status: done in code.** Split the old single effect into two: notification tap-handling registers once on mount (router read from a ref); the sync/schedule effect now checks `isAuthenticated` and reads `t`/`syncRecurring` from refs, so it only re-runs when loading/mounted/authenticated actually change - not on every language-reference churn. Separately, `clearLocalAccountState` (use-auth.ts) and the axios refresh-failure handler (api.ts) no longer wipe notification history/cooldowns or the coach-guide flag at all - that decision moved to a new `ensureAccountLocalState(userId)` (use-auth.ts), called at every login/registration/guest-creation site (there were 4 more beyond the two mutations in use-auth.ts: settings login, create-account, onboarding's guest signup, onboarding's login), which only wipes them if the incoming user id differs from whoever was last signed in on this device - a genuinely different account still gets a clean slate, the same user relogging in doesn't.

### 4a. Bigger recommendation: move notification logic to the backend (real push, not local-only)

The patch above (#4) fixes the gating/wipe bugs, but it doesn't fix something more fundamental: **every notification type except the daily check-in is architecturally incapable of reaching a user whose app is closed.**

Confirmed in code: there is no push-token registration anywhere — grepped both repos for `pushToken`/`expoPushToken`/`expo-server-sdk`, nothing. All notification logic lives client-side in `notification.service.ts`, and `sendLocal()` schedules almost every type with `trigger: null` — "fire immediately," not "fire later." They only get evaluated at all inside `syncOnAppOpen()` / `onTransactionCreated()`, which only run while the app is open. So weekly summary, monthly recap, streak, inactivity re-engagement, spending trend, guest-data-risk, and the recurring-due alert are not really *notifications* in the "reaches you while you're not looking" sense — they're on-open toasts that happen to use the OS notification tray. Only `scheduleDailyCheckIn()` genuinely registers a future OS-level trigger that can fire with the app closed.

This matters a lot for retention specifically because **the whole point of inactivity/weekly-summary/streak nudges is to reach someone who is *not* currently in the app** — and right now, by construction, they can't. A user who stops opening the app stops receiving the notifications whose entire job is to get them to open the app again. That's not a bug to patch, it's a gap in the architecture.

**What moving this server-side actually requires** (this is a real feature, not a quick fix — sizing it accordingly):
- **Client:** register for a push token (`Notifications.getExpoPushTokenAsync()`), send it to the API, re-register on token refresh/reinstall.
- **Server:** a `PushToken` table (per user, per device — a user can have multiple devices), and a dispatch path using Expo's push API (`expo-server-sdk` or raw HTTP to `exp.host/--/api/v2/push/send`).
- **Server:** move the per-user state this all depends on — `cooldowns`, `currentStreak`, `lastTransactionDate` — from the client's AsyncStorage-backed Zustand store into the database, keyed by user id. This is a second, welcome side effect: once that state is server-side, it's naturally no longer wiped on logout, which independently closes #4 and #5 above instead of needing the "don't wipe on same-user relogin" workaround.
- **Server:** reuse the Cloud Scheduler + `CRON_SECRET` pattern just built for #2 — one daily job that evaluates every user's rules (streak milestones, inactivity, weekly/monthly timing) and dispatches pushes, instead of the client doing this evaluation on open.
- **Client:** keeps local notifications only for genuinely instant, in-session events (e.g. an in-app toast confirming "transaction created"), not for anything meant to reach someone later.

**Status: done in code** (this was the largest single item across both passes — schema, service, cron, and client registration, all built):

- **Schema (2 new migrations, not yet applied — see below):** `PushToken` (per user, per device, unique token), `NotificationCooldown` (userId+type, mirrors the client's old cooldown map), and a nullable `language` column on `User` (the daily cron has no active request to read a language from, so it's captured whenever a device registers a push token).
- **Server (`notification-dispatch.service.ts`):** computes `currentStreak`/`daysSinceLastTransaction` directly from the `Transaction` table (no need for the client to report anything), evaluates the same 4 rules the client used to (streak milestones, inactivity ≥2 days, weekly on Sunday, monthly in the last 3 days), gated by the new server-side cooldown table, and sends via Expo's push HTTP API (`exp.host/--/api/v2/push/send`, batched at 100/request, no new dependency needed). Covered by a unit test on the streak/date math specifically (`notification-dispatch.service.test.ts`).
- **Server (routes):** `POST/DELETE /notifications/push-token` (register/unregister, authenticated) and `POST /cron/notifications` (`CRON_SECRET`-gated, same pattern as `/cron/recurring`). Wired into `cloudbuild.yaml` as a second Cloud Scheduler job, `spendly-notification-dispatch`, daily at 09:00 UTC — same "one fixed time, no per-user timezone" simplification as the recurring-transactions cron.
- **Client:** registers for an Expo push token (`getExpoPushTokenAsync`, using the EAS project id already in `app.json`) once authenticated, alongside the existing permission/sync flow; unregisters it on logout, before the access token is cleared. Best-effort throughout (missing permission/project id/network hiccup never blocks anything else).
- **Removed the resulting duplicate-send risk:** the client used to send streak/inactivity/weekly_summary/monthly_recap itself from `syncOnAppOpen`/`onTransactionCreated`, under its *own*, separate, local cooldown store. Left as-is, that would now fire *twice* for the same milestone - once locally on app-open, once from the server's independent cooldown. Removed those 4 sends from the client (kept the underlying streak/last-transaction-date *tracking*, since `guest-register-modal.tsx` still reads it for an unrelated feature) - the daily check-in stays client-only, since it's the one type that was already a genuine local OS-scheduled trigger.
- **Made the in-app history work for real pushes, not just local sends:** the server includes the same `titleKey`/`bodyKey`/`bodyParams` shape the client already uses internally in each push's `data` payload, so `_layout.tsx`'s notification-received listener can add a matching in-app entry for a server push exactly the way it already did for the local daily check-in - one rendering path in `notifications-screen.tsx`, not two.

**Known gap, left as-is:** a push delivered while the app is fully closed and later opened by tapping it won't get backfilled into the in-app list - only the OS tray notification and the tap-driven navigation are guaranteed; the "received" listener that adds the in-app entry only fires for foreground/background-alive delivery. Closing this needs de-duplicated backfill via `getPresentedNotificationsAsync()`/`getLastNotificationResponseAsync()` on app open, which felt like a step too far for this pass.

**Before this is live:** the two new migrations (`add_user_default_category_currency`, `add_push_tokens_and_notification_cooldowns`) need `prisma migrate deploy` - not run here, same reasoning as the Cloud Scheduler IAM step. The dispatch cron also needs the same one-time GCP setup as `/cron/recurring` (Cloud Scheduler API enabled, `roles/cloudscheduler.admin` on the deploy trigger's service account) - if that was already done for #2, this one rides along for free on the next deploy.

### 5. Onboarding coach guide reappears after every re-login
`spendly-mobile/src/shared/ui/interactive-coach.tsx:37,73`, `src/shared/stores/onboarding/onboarding.store.ts`

`hasSeenCoach` lives in `useOnboardingStore`, which is wiped by the exact same `clearLocalAccountState().reset()` call as #4 above, on every logout and every failed-refresh-triggered logout. It's local-only, so "seen once ever" is really "seen once per login session."

**Fix:** same shape as #4 — this needs to be a durable, server-side flag on the user record (or excluded from the logout wipe when the same account logs back in), not device-local state.

**Status: done in code** — fixed by the same `ensureAccountLocalState` change as #4 (it wipes `useOnboardingStore`, which holds `hasSeenCoach`, using the identical same-user check). Also removed a redundant manual `setHasSeenCoach(false)` in the onboarding guest-signup flow that's now superseded by it. Still device-local rather than server-side, so a reinstall or new device still resets it - closing that gap for real is part of 4a below.

### 6. Two independent search boxes on Home, out of sync, and search feels like it "closes" while typing
`spendly-mobile/src/screens/home/home-screen.tsx:145,172`, `src/features/transaction-search/transaction-search.tsx`

`<TransactionSearch>` is mounted **twice** in `home-screen.tsx` — once in the sticky header (line 145), once inline at the top of the scroll content (line 172) — and the component is uncontrolled (its `value` is local `useState`, not a prop from the parent). Both instances call the same `onSearchChange`, but neither instance's displayed text reflects what was typed in the other. That's the "top search bar and the scroll one have different values" bug, exactly.

The "closes after every letter" symptom is most likely the sticky header's own visibility logic: it's shown/hidden purely by scroll position (`scrollY.value > stickyThreshold.value`, `home-screen.tsx:51-59`, with `pointerEvents: 'none'` while hidden). As the filtered transaction list shrinks with each keystroke, the scrollable content's height changes, which can shift `scrollY` back under the threshold — hiding (and making non-interactive) the exact search box you were typing in.

Note: a clear ("X") button already exists in `transaction-search.tsx:53-57` — worth confirming the build you tested actually has it; if it's still missing in practice, check whether a different/older search input is rendered somewhere you didn't grep for.

**Fix:** lift `value` into `home-screen.tsx` and pass it down as a controlled prop to both instances (single source of truth), and pin the sticky header's visibility so it doesn't hide itself while it (or its twin) has focus.

**Status: done in code.** `TransactionSearch` now takes `value` as a required controlled prop instead of managing its own state; both instances in `home-screen.tsx` are wired to the same `search` state, so they can no longer show different text. Added an `onFocusChange` callback wired only to the sticky instance, feeding a shared value that forces the sticky header to stay visible (`opacity`/`pointerEvents`) while it has focus, regardless of scroll position - so it can no longer hide itself out from under you while typing. The clear ("X") button was already present in the component; nothing to fix there unless it turns out a different/stale build was what you tested.

### 7. Bottom sheet doesn't settle back down after the keyboard closes
`spendly-mobile/src/features/create-transaction/manually/create-transaction.tsx:115-123`

The manual-entry sheet (`snapPoints={['60%']}`, `keyboardBehavior="interactive"`) never sets `keyboardBlurBehavior`. The underlying library (`@gorhom/bottom-sheet`) defaults that prop to `'none'` — i.e. "leave the sheet wherever the keyboard pushed it" — instead of `'restore'`, which animates it back to the snap point once the keyboard closes. One prop, `keyboardBlurBehavior="restore"`, fixes this for the description field case.

The AI-text-create variant (`create-transaction-text.tsx`) has a comment referencing this exact prop and appears to rely on a parent sheet setting it — worth checking that inheritance actually reaches the sheet used after tapping "create," since that's likely the same missing-prop bug surfacing as "stuck mid-screen."

**Status: done in code, one part needs your on-device confirmation.** Corrected the actual bug: I'd initially misattributed which `<BottomSheet>` had which props (checked the real file - the manual-entry sheet, `<BottomSheet ref={manualRef}>`, had *no* props at all, so it was getting `@gorhom/bottom-sheet`'s own default of `keyboardBlurBehavior: 'none'`; the AI-text sheet already had `restore` set explicitly). Fixed it at the source: `shared/ui/bottom-sheet.tsx` now defaults `keyboardBlurBehavior` to `'restore'` for every sheet in the app that doesn't override it, rather than patching one call site. Separately, for the "stuck mid-screen after tapping create" case: `create-transaction-text.tsx` had a `Keyboard.dismiss()` call with a comment already flagging that programmatic dismiss conflicts with `restore` on that sheet - removed it, relying on `blurOnSubmit` (already set) to close the keyboard through the non-conflicting focus/blur path instead. This one I'm least sure about without a device to test on - it's a real fix for a real documented conflict, but I couldn't verify the animation itself.

### 8. Onboarding flashes briefly for already-authenticated users before redirecting home
`spendly-mobile/app/_layout.tsx`

Not yet traced to a specific line — worth checking the ordering between `initializeAuth()` resolving and the first navigation decision/paint in `_layout.tsx` (whether the router can render the onboarding route for one frame before `isAuthenticated` is known, vs. holding the splash until auth state is resolved).

**Status: traced and fixed in code.** Confirmed the mechanism: the redirect decision lived entirely inside a `useEffect`, which can't run until *after* the first render commits - so on the frame where auth just resolved, the `<Stack>` necessarily rendered whatever route Expo Router picked by default (onboarding) for one frame, before the effect fired and replaced it. Fixed by computing the same "does this need a redirect" condition during render (a pure check, safe to run outside an effect) and using it to render `null` instead of the `<Stack>` on that frame - the effect still does the actual `router.replace()` (a real side effect, has to stay in an effect), but the wrong route is never painted while waiting for it.

---

## P2 — Real, lower frequency or already partly mitigated

### 9. Push notification shown but not in-app, or vice versa
Same subsystem as #4 (`notification.service.ts`'s `sendLocal`) — in-app add and OS push are two separate calls (`addInAppNotification` always fires; the OS push is gated on `isPushAllowed()`), so a permission/preference edge case can desync them. Needs a specific repro to pin down further; likely resolves partially once #4's gating/effect-churn is fixed.

**Status: found and fixed the "push but no in-app entry" half.** `_layout.tsx`'s `addNotificationReceivedListener` callback was a no-op (`() => {}`) - it did nothing when the OS actually delivered a notification. That's invisible for 7 of the 8 notification types (they add their in-app entry synchronously when sent, before the OS even shows anything), but `daily_checkin` is genuinely scheduled ahead of time and can be delivered later while the app is foregrounded, with nothing ever adding it to the in-app list. Added `notificationService.recordDailyCheckInDelivered()`, called from that listener only for `type === 'daily_checkin'` (checked deliberately, to avoid double-adding the other 7 types). Residual gap I'm not fixing here: if the app is fully closed when it fires, this foreground-only listener never runs either - closing that needs 4a (or reading `getPresentedNotificationsAsync()` on app open to backfill).

### 10. Streak notification title shows literal `{{days}}`
`spendly-mobile/src/shared/services/notifications/notification.service.ts:177-184`

Exact bug: the **body** correctly does `i18nFn('notifications.streakBody').replace('{{days}}', String(streak))` — but the **title** on the line above calls `i18nFn('notifications.streakTitle')` with no interpolation at all, even though the title string also contains `{{days}}` (see `en.json`/`ru.json`). One-line fix: interpolate the title the same way (or better, pass `{ days: streak }` through i18next's own interpolation, the way `recurringDueBody` already does at line 94).

**Status: done.** Title now interpolates the same way the body already did.

### 11. Balance drifts from real-world balance over time
`spendly-api/src/business/services/currency/currency.service.ts:27-28`

Confirmed: exchange rates come from `@fawazahmed0/currency-api` via jsdelivr — a free, community-maintained feed that updates once per day upstream (cached 2h server-side on top of that). Fine for casual conversion, not for a currency tracker used daily against a currency as volatile as UAH.

**However** — see the note in "My take" below: I think the bigger contributor to your specific 600 UAH drift is #12, not this.

**Status: deliberately not touched.** You flagged this as not a priority yourself, and swapping the FX provider is a bigger, riskier change (new paid API, new API key/secret, billing) than anything else in this pass - it deserves its own conversation about which provider before I touch it, not a drive-by swap. Fixed #12 instead, which I think was doing more damage to your actual numbers anyway.

### 12. Custom keypad has no decimal key
`spendly-mobile/src/shared/ui/numeric-keyboard.tsx:33-37`

Confirmed: the key grid is hardcoded to `[1-9], [⌫,0,✓]` — there is no decimal-point key at all. Every manually-entered amount is forced to a whole number. Filed by you as a feature request, but flagging it here because it directly explains balance drift independent of FX-rate precision: two weeks of rounding every coffee/taxi/grocery amount to the nearest whole unit accumulates real money fast. I'd fix this before touching the FX API.

**Status: done in code**, and later extended into a full four-function calculator (see the "Keypad: decimals + inline calculator" feature request below - same commit, same files). Grid is now a 4-column calculator layout (`[7][8][9][÷] / [4][5][6][×] / [1][2][3][−] / [.][0][⌫][+]` + full-width confirm row) instead of the old 3-column one. The decimal-guard logic (one dot, max 2 places per operand) already existed in `input.tsx`'s handler but was missing from two other places that build the same amount string (`form-input.tsx`, `create-wallet-modal.tsx`) - it just never mattered while there was no "." key to press. Pulled it into one shared `numeric-input.ts` used by all three, so they can't drift again. Also added a light haptic tap per key press (your "more sensitive" ask) - didn't find a concrete responsiveness bug to fix, so treating this as the intended interpretation. Test the new 4-column layout and the calculator flow on device - I couldn't visually verify either.

---

## Feature requests (post-bug-fix backlog)

- **Per-wallet balance/history filter** on Home & Analytics (currently always shows the sum across all wallets). **Done in code**, backend and mobile. Confirmed none of `/reports/summary`, `/reports/categories`, `/reports/cash-flow-trend`, nor `/transaction` (list), supported a `walletId` filter before this - added it to all four (validated as a UUID in the reports query schemas; the list endpoint had no querystring schema at all before, matching its existing convention). `getSummary`'s `totalBalance` needed special handling when a wallet is selected: `DailyBalanceSnapshot` is a whole-account aggregate, not per-wallet, so there's no historical snapshot to filter - it now uses `walletService.calculateWalletBalance()` (already existed, used for the wallets screen) converted into the main currency instead. Mobile: a shared `useWalletFilterStore` (persisted, one selection shared between Home and Analytics rather than two independent ones - picking a wallet on one screen is expected to still apply on the other) plus a `WalletFilterSelector` pill+sheet component, wired into both screens' report queries and Home's transaction list. Falls back to "all wallets" automatically if the selected wallet gets archived/deleted. Not extended to the AI Insights tab (out of the explicit ask - balance + transaction history).
- **Keypad: decimals + inline calculator** — **done in code.** Full four-function calculator (+, −, ×, ÷), not just addition, evaluated strictly left-to-right with no operator precedence (a basic calculator, not scientific - "2+3×4" = 20, not 14). Keypad is now a proper 4-column grid (`[7][8][9][÷] / [4][5][6][×] / [1][2][3][−] / [.][0][⌫][+]` + a full-width confirm row). Evaluation runs in `numeric-keyboard.tsx`'s `handleClose` - on *every* dismissal path (✓ tap or backdrop tap), not just the checkmark, since dismissing via the backdrop with an unevaluated `"12+5"` sitting in the value would otherwise leak out to `parseFloat`, which silently truncates it to `12`. Logic lives in `numeric-input.ts` (`evaluateNumericExpression`), covered by its own test file.
- **Whole-number display toggle** in Settings (same pattern as the existing notification switches). **Done in code.** Added `useDisplayPreferencesStore` (persisted `roundAmounts` boolean) and a Settings toggle matching the push-notifications one. `formatCompact` - the one formatter used for every money display in the app (balance, income/expense, transaction rows, charts, wallets, AI confirmation) - now takes a `roundToWhole` second argument; wired it through all 9 files that call it, reading the setting via the store hook so every screen updates live when it's toggled, no navigation required.
- **Default category/currency per transaction type** in Settings (e.g. default income category = Salary, default expense category = Food; default transaction currency = MDL even though the main/base currency is UAH). **Done in code**, migration written but not applied (per your call - you're applying it yourself). Added 3 nullable columns to `User` (`defaultIncomeCategoryId`, `defaultExpenseCategoryId`, `defaultCurrencyCode` - all `SetNull` on delete, since losing the referenced category/currency should just clear the preference, not block deleting it) - see migration `add_user_default_category_currency`. Extended the existing `PUT /profile/update-settings` endpoint (made `mainCurrencyCode` optional there in the process, so a settings update can touch just one field) rather than adding new routes. Settings UI: Currencies screen got a "Default"/"Set Default" pill next to each currency's existing "Main"/favorite controls (a currency can be main and default at once - that's a harmless no-op, not worth special-casing); Categories screen got the same pattern per-row, scoped to whichever Income/Expense tab is active. Both are instant toggles (tap again to clear), no confirmation dialog - unlike changing the *main* currency, this has no side effects on existing data. Wired into `transaction-form.tsx`: the type-driven category-clearing effect now pre-fills the type-appropriate default instead of clearing to empty, and the currency default is applied as a fallback in the same effect that applies `initialValues` - an explicit AI-parsed value still wins over the default in both cases. Since I only had one settings row's visual budget to reason about without a device, worth checking the Currencies screen doesn't feel cramped now that a row can show favorite-star + Default pill + Main pill/badge all at once.

---

## My take

- The AI parser (#1) and the cron/recurring pipeline (#2) are the two items I'd fix before anything else — one's the core value prop, the other is silent data loss with no user-visible symptom until someone notices a missing recurring transaction weeks later.
- #4/#5's shared root cause (local-only state nuked by the exact same `reset()` call on every logout, plus a missing `isAuthenticated` gate) means fixing that one call site fixes three of your reported bugs at once — worth doing as a single pass rather than three separate tickets.
- #4a (moving notifications server-side) is the one I'd actually push up in priority despite it being the biggest lift here — right now the notifications whose entire purpose is re-engagement (inactivity, weekly summary, streak) structurally cannot fire for a user who isn't already in the app, which is a real ceiling on retention, not just a polish item. The quick patch in #4 is still worth doing first (it's cheap and fixes real symptoms today), but I wouldn't treat it as "done" for the retention goal — it's a stopgap until the real push pipeline exists.
- #12 (no decimal key) is a feature request in your list but I'd treat it as a correctness bug — it's a plausible bigger cause of your balance drift than the FX API you already flagged as low priority.
- #3 (false limits alert) is a nasty one to hit during dogfooding but rare in practice *unless* the per-IP rate limit is genuinely too tight for normal usage patterns (parallel requests on app open, pull-to-refresh) — worth checking Cloud Run logs for 429 rates before assuming it's rare.

## Status as of 2026-09-13 (third pass — everything requested is now in code)

You asked for 4a, the wallet filter, and the calculator (expanded to all 4 operators) to be built, and for the default category/currency migration to be written for you to apply yourself. All four are done. Only one item remains genuinely untouched:
- **FX provider swap** (#11) — you called this low priority yourself; left alone.

**Two migrations are written but not applied** (`add_user_default_category_currency`, `add_push_tokens_and_notification_cooldowns`) - no local Postgres was available here to run `prisma migrate dev` against, so both were hand-written and cross-checked against Prisma's own offline schema-diff engine (`prisma migrate diff --from-schema-datamodel ... --to-schema-datamodel ...`, which doesn't need a live DB) to confirm they exactly match what Prisma itself would generate. You'll need to run these via the migration deploy pipeline before either default preferences or push notifications work end-to-end.

**Two GCP one-time setup steps are needed** before the Cloud Scheduler-based cron jobs actually run: Cloud Scheduler API enabled + `roles/cloudscheduler.admin` on the deploy trigger's service account (`dev-cloud-build-sa@...`) - covered in #2's section above. Both `spendly-recurring-cron` and the new `spendly-notification-dispatch` job ride on the same one-time grant.

Nothing has been deployed, run on a simulator/device, or committed to git. Typecheck/lint/unit tests pass on both repos for everything that was touched, but that verifies correctness of the code, not the actual UI/animation behavior on a real screen (especially #6's sticky-header pin, #7's bottom-sheet settle, #12's new 4-column keypad, and the currencies-screen row density with the new Default pill) - those need your on-device pass. The notification dispatch pipeline in particular has no way to be verified end-to-end without a deployed API, a migrated database, and a real device with a push token - I'd treat that as the highest-risk piece to test first.
