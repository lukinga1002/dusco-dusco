# Base44 Build Prompt — Dusco frontend + landing page

> Copy everything below the line into Base44 as your build prompt.

---

## 0. What you are building

Build a **complete frontend** (marketing landing page + full authenticated web app) for **Dusco**, a Tanzanian digital envelope-savings and group-savings product operated by Larson Consulting.

**The backend already exists and is live. Do NOT build a backend, database, or auth system.** Your job is 100% frontend: screens, components, state, design, and API calls against the documented REST API below. Every screen must be wired to the real endpoints listed in Section 3.

### The product in one paragraph
Tanzanians already save in physical envelopes — money divided by purpose: school fees, farm, emergencies, a wedding. Dusco digitises that habit. Each user gets one **Dusco number** (e.g. `DUS-A3K9M2`). Money sent to that number splits **automatically** across savings envelopes (**bahasha**, plural *bahashas*) by percentages the user set. The same model works for savings groups (**kikoba / chama / VICOBA**), which get their own group Dusco number, group envelopes, and a member contribution ledger.

### Language & vocabulary (use these exact words in the UI)
- **Bahasha** = a savings envelope. Plural: bahashas.
- **Dusco number** = the user's or group's unique payment reference.
- **Kikoba / Chama / VICOBA** = community savings group.
- **Akiba** = savings, **Karo** = school fees, **Safari** = travel, **Binafsi** = personal (these are example envelope names).
- Currency is **Tanzanian Shilling**, displayed as `TZS 2,410,000` — always whole numbers, thousands separators, never decimals.
- UI copy is **English with Swahili product nouns** kept in Swahili (bahasha, kikoba, akiba). Do not translate those.

---

## 1. Critical technical constraints

**API base URL:** `https://dusco-dusco.onrender.com/api`

- CORS is already open on the backend — call it directly from the browser. Do not build a proxy.
- **Auth:** JSON Web Token. On login/verify you receive `token`. Store it and send on every authenticated request as the header `Authorization: Bearer <token>`.
- All request and response bodies are JSON. Errors return a non-2xx status with `{ "error": "message" }` — always surface `error` to the user in readable form, never a raw stack or "[object Object]".
- **IMPORTANT — cold starts.** The backend runs on a free tier that sleeps when idle. The **first request after a period of inactivity can take 30–60 seconds.** You MUST handle this gracefully:
  - Use a generous request timeout (at least 90 seconds).
  - On the first load / login, show a friendly loading state ("Waking up secure servers…") rather than a spinner that looks frozen or an error.
  - Never show a failure before 60 seconds have elapsed.
- **OTP is simulated** in this build: any 4-digit code is accepted. Label it clearly in the demo UI.
- **Money movement is simulated.** There is a deposit simulator (see Section 3) used to demonstrate the auto-split. Label simulated actions honestly — do not imply real money is moving.

---

## 2. Design direction

The existing UI works but feels generic. **Make this feel like a premium, trustworthy financial product** — the kind of app someone trusts with their savings — while staying fast and light on a mid-range Android phone.

**Brand**
- Primary brand colour: **`#ED1B24`** (Dusco red). This is established — keep it as the primary, but you may build a richer, more sophisticated palette around it (deep neutrals, warm off-whites, one or two supporting accents). Avoid a flat wall of red; use it with intent.
- Envelope colours already returned by the API (use the `color` field on each bahasha): `#ED1B24`, `#3B82F6`, `#16A34A`, `#F59E0B`, `#8B5CF6`, `#EC4899`.

**Feel**
- Mobile-first. Most users are on phones. Design for ~390px width first, then scale up gracefully to desktop.
- Calm, confident, uncluttered. Generous whitespace. Strong typographic hierarchy. Numbers are the hero — treat balances as display type with tabular figures.
- Motion with restraint: purposeful transitions, a satisfying card flip, a smooth split animation. Nothing bouncy or gimmicky.
- Rounded, tactile cards with real depth (soft, layered shadows — not harsh borders).
- Accessible: WCAG AA contrast, real focus states, tap targets ≥ 44px, works with system dark mode if you support it.

**What to avoid**
- Generic SaaS dashboard look. Crypto-app aesthetics. Stock-photo collages. Emoji as primary iconography (the current build overuses emoji — use a proper icon set instead).

---

## 3. The API contract — build against exactly this

### 3.1 Auth
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{phone, name, password}` (password ≥ 6 chars) | `{message, userId, duscoNumber, phone}` |
| POST | `/auth/verify-otp` | `{phone, otp}` (otp = 4 digits, any) | `{message, token, userId}` |
| POST | `/auth/login` | `{phone, password}` | `{token, user:{id, phone, name, duscoNumber, isVerified}}` |
| GET | `/auth/me` | — | `{id, phone, name, duscoNumber, isVerified, createdAt}` |
| PUT | `/auth/profile` | `{name}` | `{message}` |

Phone format is Tanzanian local, e.g. `0712345678`.

### 3.2 Bahashas (envelopes)
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/wallets` | — | `{totalBalance, bahashas:[{id, name, percentage, balance, color, isLocked, lockUntil, goalName, goalAmount, createdAt}]}` |
| POST | `/wallets` | `{name, percentage, goalName?, goalAmount?}` | the created bahasha |
| PUT | `/wallets/:id` | see below | updated bahasha or `{message}` |
| PUT | `/wallets/batch/rebalance` | `{allocations:[{id, percentage}]}` | `{message, bahashas}` |
| DELETE | `/wallets/:id` | `{transferToId?}` | `{message}` |

`PUT /wallets/:id` has three modes:
- **Edit:** `{name?, percentage?, goalName?, goalAmount?}` → returns the updated bahasha.
- **Lock:** `{lockUntil: "2026-12-31"}` (must be a future date) → `{message}`.
- **Unlock:** `{unlock: true}` → if unlocked early, returns `{message, penalty, newBalance}` (a **2% penalty** on the balance); if the lock has already expired, just `{message}`.

**Rules the UI must enforce and explain:**
- Minimum **2** bahashas, maximum **6**.
- Percentages must never exceed 100% total; the rebalance endpoint requires them to sum to **exactly 100%** and needs at least 2 allocations.
- Deleting a bahasha with a balance > 0 requires `transferToId` — prompt the user to choose where the money goes.
- A savings **target (goal) is optional**, enabled by a toggle. Only send `goalName` + `goalAmount` when the toggle is on.

### 3.3 Transactions
| Method | Endpoint | Body / Query | Returns |
|---|---|---|---|
| POST | `/transactions/deposit` | `{amount, sourceNetwork, senderPhone?, external?}` | `{message, grossAmount, crossNetworkFee, netAmount, sourceNetwork, senderPhone, external, transactionId, splits:[{bahashaId, bahashaName, percentage, amount, color}]}` |
| POST | `/transactions/withdraw` | `{bahashaId, amount, destinationPhone, destinationNetwork}` | `{message, amount, netSent, withdrawalFee, feeWaived, destination, bahashaName, remainingBalance, transactionId}` |
| GET | `/transactions` | `?limit=&offset=&type=&bahashaId=&startDate=&endDate=` | `{total, transactions:[{id, bahashaName, type, amount, fee, sourceNetwork, destination, description, createdAt}]}` |
| GET | `/transactions/fee-preview` | `?type=withdrawal&bahashaId=&amount=` (or `?type=deposit&sourceNetwork=&amount=`) | withdrawal: `{fee, feeWaived, feeWaivedReason}` · deposit: `{fee, feeWaived, netAmount}` |

> `type` is **required** — it must be `deposit` or `withdrawal`, or the endpoint returns
> HTTP 400 `{"error":"Type must be deposit or withdrawal"}`.

Transaction `type` values: `deposit`, `withdrawal`, `fee`, `dividend`, `transfer`, `penalty`.

### 3.4 Groups (kikoba)
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/groups` | — | `{groups:[{id, name, duscoNumber, description, memberCount, totalBalance, socialBalance, sharesBalance, contributionFrequency, contributionSharesAmount, contributionSocialAmount}]}` |
| POST | `/groups` | `{name, description?, contributionSharesAmount, contributionSocialAmount, contributionFrequency, bahashas:[{name, percentage, goalName?, goalAmount?}], invitePhones:[]}` | `{id, name, duscoNumber}` |
| GET | `/groups/:id` | — | `{group:{...}, userRole, memberCount, totalBalance, socialBalance, sharesTotal, bahashas:[...], members:[{id, name, phone, role, sharesTotal, lastContribution}], recentTransactions:[...]}` |
| POST | `/groups/:id/contribute` | `{type: "shares"｜"social"｜"both", sourceNetwork}` | `{message, sharesAmount, socialAmount, splits}` |
| POST | `/groups/:id/withdraw` | `{bahashaId, amount, destinationPhone, destinationNetwork, purpose}` | `{message, amount, netSent, fee, bahashaName, note}` |
| GET | `/groups/:id/members` | — | `{members:[...]}` |
| GET | `/groups/:id/transactions` | `?type=&limit=&offset=` | `{total, transactions}` |
| POST | `/groups/:id/invite` | `{phone}` | `{message}` |

**Group concepts:**
- A group has two money pools: **shares** (each member's tracked contributions — a member contribution/share ledger for internal group accounting) and **social fund** (split across group bahashas by percentage, like personal envelopes).
- Roles: `admin`, `treasurer`, `member`. **Only admin or treasurer can withdraw.** Only admin can invite. The UI must hide/disable actions by `userRole` and explain why.
- Group bahasha percentages must sum to 100%.
- Invites work by phone number and only for people already registered on Dusco — handle the "User not found. They must register on Dusco first." error kindly.

### 3.5 Dividends
- `GET /dividends/projection` → a projection object.
- `GET /dividends/history` → `{totalEarned, dividends:[{id, amount, bahashaName, yieldRate, periodStart, periodEnd, creditedAt}]}`.

Present these as **projected/illustrative**, never as guaranteed returns.

### 3.6 Notifications
- `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/batch/read-all`.
- Show an unread count badge in the header and a notification panel.

### 3.7 Admin (separate, gated area)
`POST /admin/login {username, password}` returns a **separate admin token** — store it separately from the user token and send it as `Authorization: Bearer <adminToken>`.
Then: `GET /admin/dashboard`, `GET /admin/users`, `GET /admin/users/:id`, `GET /admin/transactions`, `POST /admin/dividends/distribute`.

**Never hardcode admin credentials in the frontend** — always prompt for them on an admin login screen at a separate route (e.g. `/admin`).

---

## 4. Business rules the UI must implement correctly

These are non-negotiable — the numbers shown must match the backend exactly.

1. **Cross-network deposit fee:** 1% of the amount, **minimum TZS 500**. **Free** when the sender's network is the settlement network (currently M-Pesa). The fee is deducted from the incoming amount, and the **net** is what splits across bahashas.
2. **Withdrawal fee:** 1%, **floor TZS 500, cap TZS 5,000**.
3. **90-day fee waiver:** the withdrawal fee is **waived entirely** when the money has been held 90+ days. When `feeWaived` is true, celebrate it — show the reason ("90-day savings bonus"). Always call `/transactions/fee-preview` before confirming a withdrawal so the user sees the real fee.
4. **Fees are FEE-INCLUSIVE.** This is critical and the old UI got it wrong. The fee comes **out of** the amount the user enters — it is not added on top. If a user sends 980,000 from a bahasha, 980,000 leaves the bahasha and the recipient receives `980,000 − fee`. Always show a clear breakdown before confirmation:
   - *Amount leaving your bahasha* · *Fee* · **Recipient receives**
5. **Early unlock penalty:** 2% of the bahasha balance. Warn clearly with the exact shilling amount before the user confirms.
6. **Rebalancing on add:** when a user adds a new bahasha, the existing percentages no longer sum to 100%. The UI must then walk the user through reassigning percentages across **all** bahashas and call `/wallets/batch/rebalance`. Do not silently leave allocations broken.
7. **Show every fee before money moves.** No charge should ever surprise the user.

**Networks to offer** in dropdowns: M-Pesa, Mixx by Yas (Tigo Pesa), Airtel Money, Halotel, Azam Pesa, CRDB, NMB, Selcom. Make this list easy to extend.

---

## 5. Screens to build

### A. Landing page (public, unauthenticated) — make this excellent
This is the first thing a partner, investor, or user sees. It must be genuinely well designed and persuasive, not a template.

Sections:
1. **Hero** — the core promise: *one Dusco number; money sent to it splits automatically into your savings envelopes.* Strong headline, clear subhead, primary CTA ("Get started"), secondary ("See how it works"). Include a striking product visual showing money splitting into envelopes.
2. **The problem** — Tanzanians save by purpose, not by pool; money is fragmented across networks; group saving is large but runs on paper and cash boxes.
3. **How it works** — 3 steps: *Set your bahashas and percentages → Share your Dusco number → Money arrives and splits itself.* Visual, not wordy.
4. **Features** — automatic splitting; receive from any network or bank; goals and locks; group/kikoba savings with a member contribution ledger; privacy by default; transparent fees shown before every transaction.
5. **For groups (kikoba/VICOBA)** — the digital cash box: group Dusco number, contributions tracked per member, shares and social fund separated.
6. **Trust & transparency** — fees explained plainly in a small table; a clear statement that Dusco is operated by Larson Consulting, a registered company, and that customer funds are designed to be held with a licensed financial institution. Keep this factual and modest — **do not claim licences, partnerships, bank names, or user numbers that aren't given to you.**
7. **FAQ** and **Footer** — footer must include working links to **Privacy Notice** and **Terms**.

**Do not invent statistics, testimonials, customer logos, press mentions, or user counts.** If you need social proof placeholders, use clearly-labelled neutral copy.

### B. Auth flow
- **Register** (name, phone, password) → **OTP verification** (4 digits, any code, clearly labelled as demo) → app.
- **Login** (phone, password).
- On registration success, present the user's new **Dusco number** as a moment — this is their identity in the product.
- **Add a consent step** (see Section 6).

### C. Dashboard (home)
- **Total balance hero**, **blurred by default**, revealed by tap. This is a deliberate privacy feature for shared spaces — make the reveal feel intentional and smooth.
- Two primary actions directly under the hero, **visually identical in size and weight**: **Add Money** and **Send**. (In the old build these were mismatched — get this right.)
- **Bahasha cards** in a grid. Each card is a **flip card**: the front shows the envelope name and its allocation percentage only; flipping reveals the balance and, if a target is set, the progress bar with a "to reach {target}" caption.
  - **Critical consistency rule:** every bahasha card must look identical in structure whether or not it has a savings target. Target details appear **only on the revealed face**. Cards with a goal must not be taller or busier than cards without one. The old build repeatedly broke this — do not.
- Recent activity list.
- Entry point to groups and to "+ Add Bahasha".

### D. Add Money
Two modes in one sheet:
1. **Receive money** (the real product mechanic) — display the user's Dusco number large, with a copy button and clear instructions: *open M-Pesa/Airtel/your bank app → send money → paste your Dusco number as the recipient → it lands in Dusco and splits automatically.*
2. **Simulate an incoming transfer** (clearly labelled demo tool) — amount, sender network, sender phone → shows a fee/net breakdown → posts to `/transactions/deposit` → then plays a **split animation** showing the money dividing across the bahashas using the returned `splits` array with each envelope's colour. This animation is the product's signature moment — make it genuinely delightful.

### E. Send
- Pick a bahasha (the picker must show envelope name and percentage only — **no balances, no target details**, consistent with the privacy model).
- Choose destination: mobile money or bank, with phone/account entry.
- Amount, defaulting to the option of sending the **whole bahasha**.
- Live fee preview from `/transactions/fee-preview`, showing the fee-inclusive breakdown and flagging a waived fee.
- Confirm → success state with what the recipient receives.

### F. Manage bahashas
- List with per-card amount hidden behind the same flip interaction.
- Create, rename, change percentage, set/clear an optional goal (toggle), lock until a date, unlock (with penalty warning), delete (with balance-transfer flow).
- **Rebalance flow** when adding: assign new percentages across all envelopes, with a live "must total 100%" indicator, then call the rebalance endpoint.

### G. Groups (kikoba)
- List of groups with balances and member counts.
- Create group: name, description, contribution amounts (shares + social) and frequency, group bahashas with percentages summing to 100 (with the same optional-target toggle), and invites by phone.
- Group detail: group Dusco number, total/social/shares balances, group bahasha cards, member list with each member's share total and last contribution, recent group activity, and actions (contribute, withdraw, invite) **gated by role**.

### H. Transactions history
- Filter by type, bahasha, and date range; paginated. Clear visual language for money in vs money out, with fees shown on the relevant row.

### I. Profile & settings
- Name, phone, Dusco number, member since.
- Notification preferences.
- **Privacy Notice**, **Terms**, and data-rights controls (Section 6).
- Log out.

### J. Admin area (separate route)
Admin login, then a dashboard of platform totals, a user list and user detail, a transaction log, and the dividend distribution action. Functional and clean; it does not need the consumer polish.

---

## 6. Add these (they do not exist yet and are required)

Dusco handles financial data about identifiable people in Tanzania, which is high-risk personal data under the Personal Data Protection Act (Cap. 44, 2023). The current build lacks these — **build them in**:

1. **Consent capture at registration.** A clear, **unbundled** consent step — separate, explicit checkboxes (not pre-ticked, not buried in Terms) for: (a) processing their financial/transaction data to operate the savings service, and (b) *optionally and separately*, marketing messages. Record what they agreed to and when. Users must be able to withdraw consent later from settings.
2. **A real Privacy Notice page**, linked from the footer, the registration screen, and settings — explaining what data is collected, why, the lawful basis, how long it is kept, who it is shared with (payment partners), and the user's rights.
3. **Data-subject rights in settings:** *Download my data*, *Correct my details*, and *Delete my account and data* (with a confirmation flow). Wire these to whatever endpoints exist; where an endpoint does not yet exist, build the UI and clearly mark it as pending so the backend can be added.
4. **Privacy-first defaults everywhere:** balances blurred by default, no balances in pickers or previews, and no sensitive values in URLs or query strings.

---

## 7. Quality requirements

- **Loading states** for every async action — skeletons, not blank screens. Remember the 30–60 second cold start.
- **Empty states** that teach (no bahashas, no groups, no transactions).
- **Error states** that are human: show the API's `error` message, offer a retry.
- **Optimistic feedback** on actions, with rollback on failure.
- **Form validation** before submitting: phone format, password length, percentage totals, amount greater than the fee.
- Fully **responsive**; flawless at 390px.
- No console errors. No broken links. No placeholder lorem ipsum in shipped screens.

---

## 8. Explicitly do NOT

- Do not build or mock a backend, database, or your own auth — use the live API above.
- Do not change the fee mathematics or invent new fees.
- Do not claim Dusco holds customer deposits, is licensed by the Bank of Tanzania, or has named bank/payment partners.
- Do not invent statistics, user numbers, testimonials, or press logos.
- Do not display real money as having moved — simulated actions must be labelled.
- Do not hardcode any credentials or secrets in the frontend.
