# Base44 Build Prompt — Dusco v2: Personal Finance

> Copy everything below the horizontal rule into Base44 as your build prompt.

---

## 0. What you are building

Add a **Personal Finance** section to Dusco, an existing Tanzanian savings product. Dusco
already lets people split incoming money across savings envelopes (*bahasha*) and run group
savings (*kikoba*). This adds spending capture, budgeting and insight — and connects the two,
so that money a person underspends can be moved into their savings.

You are extending an existing React codebase. Match what is already there; do not restyle it.

---

## 1. CRITICAL CONSTRAINTS — read these first

### 1.1 Do NOT use the Base44 platform for anything

This is the most important instruction in this brief. A previous feature had to be thrown away
because it was built on Base44's backend.

**Do not create or use any of the following:**
- Base44 **entities** (`base44/entities/*.jsonc`)
- Base44 **functions** (`base44/functions/*`)
- Base44 **workflows** (`base44/workflows/*`)
- `@base44/sdk`, `base44.functions.invoke(...)`, `base44.entities`, `base44.auth`, or any
  other Base44 SDK call
- Base44 authentication or Base44-hosted storage

Dusco runs on **Express + PostgreSQL (Supabase) + Render**, with its own JWT auth. Anything
built on Base44's backend cannot run there and will be deleted. **Every** server interaction
must be an HTTP call to the Dusco API described in Section 4.

### 1.2 Everything must be translatable

Dusco ships in **English and Kiswahili**. The person chooses at registration and the choice is
stored on their account.

- Never hardcode user-facing text. Use the existing hook: `const t = useT();` from `@/lib/i18n`,
  then `t("finance.budget.title")`.
- Add every new key to **both** `src/lib/locales/en.js` **and** `src/lib/locales/sw.js`.
  The two files must contain exactly the same keys.
- `src/lib/i18n.jsx` compares the locales on startup in development and logs anything missing.
  **Watch that console as you work** — a missing key means a Kiswahili user meets an English
  sentence mid-page, which is the specific failure we are avoiding.
- Keep Kiswahili product nouns untranslated in both languages: *bahasha, akiba, kikoba, karo,
  daladala, bodaboda, mama ntilie, michango*.

### 1.3 Match the existing design system

- Use the existing tokens, not new colours: `dusco-ink`, `dusco-cream`, `dusco-sand`,
  `dusco-line`, `dusco-gold`, `dusco-gold-soft`, `dusco-green`, `dusco-red`, `primary`,
  `muted-foreground`, `card`.
- Use the existing components in `src/components/ui/*` and the existing patterns:
  `QueryFeedback` for loading/error, `PrivacyBalance` for amounts that should be hidden by
  default, `FeeBreakdown`, `AuthShell`, `AppShell`.
- Fonts and type scale are already set (`font-display`, `font-body`). Do not introduce new ones.
- Mobile-first: perfect at 390px, no horizontal scroll, tap targets ≥ 44px.
- Data fetching uses **@tanstack/react-query**, as the rest of the app does.

### 1.4 Honesty rules

- Never show a feature that does not work. If something is not built, say so plainly or leave
  it out — do not render a control that silently fails.
- Do not invent statistics, merchant partnerships, or claims about returns.
- Money is simulated in this environment. Keep the existing "Demo · no real funds" labelling
  style wherever money appears.

---

## 2. The product idea, and why it is shaped this way

### 2.1 In Tanzania, spending leaves an SMS, not a receipt

Most daily spending — daladala, bodaboda, mama ntilie, duka, airtime — produces **no receipt**.
What it does produce is an **SMS confirmation** from M-Pesa, Mixx by Yas, Airtel Money, Halotel
or a bank. Bank apps such as CRDB SimBanking also email or display a **PDF receipt** for larger,
formal payments.

Dusco is a **web app**, and web apps cannot read SMS. So capture has to be something the person
does deliberately, and the job of this feature is to make that as close to effortless as possible.

### 2.2 The capture ladder — build in this order

1. **Paste an SMS** (highest priority). The person copies a confirmation message and pastes it
   in. Dusco parses it into a draft they confirm. Works on the web, needs no permissions.
2. **Forward an email receipt.** Each person gets a unique forwarding address. Bank PDF receipts
   sent there appear in an inbox awaiting confirmation.
3. **Upload a receipt** (PDF, JPG, PNG, or a screenshot). Parsed into a draft, including line
   items where they can be read.
4. **Quick manual entry.** Amount, category, done — in three taps. Cash is still a large share of
   spending, and nothing else captures it.

**Every parsed item is a DRAFT the person confirms or corrects before it is saved.** Never write
a parsed record straight to their history. Parsing is good, not perfect, and silently wrong
spending data destroys trust in the whole product.

### 2.3 The loop that makes this worth building

Standalone expense trackers struggle, because logging spending is a chore with no payoff. Dusco
has something they do not: savings envelopes. Close the loop.

When someone underspends a budget category, offer to move the difference into a bahasha:

> *"You underspent transport by TZS 30,000 this month. Move it to Safari?"*

Tapping it opens the existing **Add Money** flow pre-filled with that amount and bahasha. (The
money sits in the person's mobile wallet, not inside Dusco, so this is a prompt to deposit — not
an internal transfer. Do not imply money moves by itself.)

This loop is the point of the feature. Build it, do not treat it as a nice-to-have.

---

## 3. Screens to build

All live under `/app/finance`, reachable from the existing bottom navigation (add a "Finance"
item; keep Home, Bahashas, Groups, Activity).

### A. Finance home — `/app/finance`
- **Month selector** (default: current month).
- **Spent this month**, with comparison to last month (up/down, amount and percentage).
- **Fees paid this month** — give this its own prominent card. See §3F; it is the feature most
  likely to make someone care.
- **Where your money went** — category breakdown, largest first, with share of total. Keep it
  simple and legible on a phone; a horizontal bar list beats a pie chart at 390px.
- **Budget progress** — categories with a budget set, showing spent vs limit.
- **Sweep suggestion** — the underspend prompt from §2.3, when one is available.
- **Record a spend** — a prominent primary action opening the capture sheet (B).
- Empty state that teaches: explain the four ways to record a spend.

### B. Record a spend — a sheet with four tabs
Order the tabs exactly as in §2.2.
1. **Paste SMS** — a textarea, a Parse button, then the draft confirmation card (D).
2. **Email** — show the person's unique forwarding address with a copy button, short
   instructions, and their pending inbox (E).
3. **Upload receipt** — file picker (PDF/JPG/PNG), preview, Parse, then the draft card (D).
   State plainly that the image is used to read the details and is **not kept** afterwards.
4. **Manual** — amount, category, date (default today), optional merchant and note.

### C. Spending history — `/app/finance/spending`
Filter by month, category and capture source. Paginated. Each row: merchant or description,
category, date, amount, and a small badge showing how it was captured (SMS / email / receipt /
manual). Tapping a row opens edit/delete.

### D. Draft confirmation card (shared component)
After any parse, show what was read and let the person fix it before saving:
- amount, merchant, date, category (pre-selected from the suggestion), fee if one was detected,
  reference, and line items if the receipt had them.
- Show a **confidence signal** on fields the parser was unsure about — highlight them, don't hide
  them.
- Buttons: **Save**, **Discard**. Never auto-save.

### E. Inbox — pending forwarded receipts
A list of items received by email and not yet confirmed, each opening the draft card (D).

### F. Fees — `/app/finance/fees`
A dedicated view, because this is the insight people react to most strongly.
- Total fees paid in the period, stated bluntly.
- Breakdown by network and by transaction type.
- Count of fee-bearing transactions and the largest single fee.
- A line putting it in context, e.g. *"That is 4% of everything you spent this month."*

### G. Budgets — `/app/finance/budgets`
- Set a monthly limit per category; categories without a limit are simply untracked.
- Live total of all limits against stated monthly income, if the person has entered one.
- Visual state per category: under, close (≥80%), over.
- Copy last month's budgets in one tap.

---

## 4. The Dusco API — build against exactly this

**Base URL:** `https://dusco-dusco.onrender.com/api`
**Auth:** `Authorization: Bearer <token>` — reuse the existing `src/lib/duscoApi.js` request
helper and its 95-second timeout; do not write a second HTTP client.

> **These finance endpoints are not deployed yet.** They are being built to this exact contract.
> Put them in a new `src/lib/financeApi.js`, and add a `src/lib/financeFixtures.js` with
> realistic sample data plus a single flag (`const USE_FIXTURES = true`) so the screens can be
> built and reviewed before the backend lands. Everything else — shapes, field names, error
> handling — must match this contract so the switch is a one-line change.

### 4.1 Categories
`GET /finance/categories` →
```json
{ "categories": [
  { "key": "chakula", "labelEn": "Food & groceries", "labelSw": "Chakula na manunuzi",
    "group": "essentials", "icon": "shopping-basket" }
]}
```
Render `labelEn` or `labelSw` according to the active language.

### 4.2 Spending records
| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/finance/spending` | `?from=YYYY-MM-DD&to=&categoryKey=&source=&limit=&offset=` | `{ total, totalAmount, records: [...] }` |
| POST | `/finance/spending` | `{ amount, categoryKey, merchant?, spentAt, note?, fee?, source, reference? }` | the created record |
| PUT | `/finance/spending/:id` | any of the above fields | updated record |
| DELETE | `/finance/spending/:id` | — | `{ message }` |

A record:
```json
{ "id": 12, "amount": 25000, "fee": 500, "categoryKey": "usafiri",
  "merchant": "Daladala", "note": null, "spentAt": "2026-10-14",
  "source": "sms", "reference": "QR12AB34", "network": "M-Pesa",
  "createdAt": "2026-10-14T08:12:00Z" }
```
`source` is one of `sms | email | receipt | manual | dusco`.
Amounts are **whole TZS integers**. Never show decimals.

### 4.3 Capture / parsing — all return a DRAFT, nothing is saved
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/finance/parse-sms` | `{ text }` | `{ draft, confidence, unparsedFields: [] }` |
| POST | `/finance/parse-receipt` | `{ fileBase64, filename, mimeType }` | `{ draft, confidence, unparsedFields, lineItems: [] }` |
| GET | `/finance/inbox` | — | `{ items: [ { id, draft, receivedAt, fromAddress } ] }` |
| POST | `/finance/inbox/:id/dismiss` | — | `{ message }` |
| GET | `/finance/forwarding-address` | — | `{ address }` |

`draft` has the same shape as a spending record, minus `id` and `createdAt`, plus
`suggestedCategoryKey`. `confidence` is `high | medium | low`. `unparsedFields` lists field
names the parser could not read — highlight exactly those in the draft card.

### 4.4 Budgets
| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/finance/budgets` | `?month=YYYY-MM` | `{ month, totalLimit, totalSpent, budgets: [...] }` |
| PUT | `/finance/budgets` | `{ month, budgets: [ { categoryKey, limit } ] }` | the saved month |

A budget row: `{ categoryKey, limit, spent, remaining, pctUsed }`.

### 4.5 Summary, fees and the sweep
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/finance/summary` | `?month=YYYY-MM` | `{ month, totalSpent, totalIncome, safeToSpend, byCategory: [ { categoryKey, amount, pct } ], feesPaid, vsLastMonth: { amount, pct, direction }, topMerchants: [ { merchant, amount } ] }` |
| GET | `/finance/fees` | `?from=&to=` | `{ totalFees, count, biggestSingle, pctOfSpend, byNetwork: [ { network, amount, count } ], byType: [ { type, amount } ] }` |
| GET | `/finance/sweep-suggestion` | `?month=YYYY-MM` | `{ available, amount, categoryKey, suggestedBahashaId, message }` or `{ available: false }` |

**The sweep action is not an API call.** When the person accepts, navigate to the existing
Add Money screen with the amount and bahasha pre-filled. Do not imply Dusco moved money itself.

### 4.6 Endpoints that already exist and should be reused
`GET /wallets` (bahashas, for the sweep target), `GET /auth/me` (profile and `language`),
`GET /transactions` (money already moving through Dusco). Do not duplicate these.

---

## 5. Categories — localised, not generic

Generic Western categories feel foreign here. Use this taxonomy; the API serves it, but build the
UI expecting these keys and both labels.

| key | English | Kiswahili |
|---|---|---|
| `chakula` | Food & groceries | Chakula na manunuzi |
| `mama_ntilie` | Eating out | Chakula cha nje |
| `usafiri` | Transport (daladala, bus) | Usafiri (daladala, basi) |
| `bodaboda` | Bodaboda | Bodaboda |
| `mafuta` | Fuel | Mafuta |
| `karo` | School fees | Karo |
| `vifaa_shule` | School supplies | Vifaa vya shule |
| `kodi_nyumba` | Rent | Kodi ya nyumba |
| `umeme` | Electricity (LUKU) | Umeme (LUKU) |
| `maji` | Water | Maji |
| `vocha` | Airtime & data | Vocha na bando |
| `afya` | Health & medicine | Afya na dawa |
| `mavazi` | Clothing | Mavazi |
| `michango` | Contributions (harusi, msiba) | Michango (harusi, msiba) |
| `biashara` | Business | Biashara |
| `burudani` | Entertainment | Burudani |
| `mkopo` | Loan repayment | Marejesho ya mkopo |
| `ada_miamala` | Transaction fees | Ada za miamala |
| `akiba` | Savings | Akiba |
| `nyingine` | Other | Nyingine |

`ada_miamala` is assigned automatically when a fee is detected — the person should not have to
categorise their own bank charges.

---

## 6. Data protection — build these in, they are not optional

Spending data is far more revealing than a balance: it shows merchants, locations, health
purchases, and who someone sends money to. Tanzania's Personal Data Protection Act (Cap. 44,
2023) applies, and Dusco already has consent and data-rights machinery you must extend rather
than bypass.

1. **A separate consent for this feature.** Personal Finance must not be usable until the person
   has given its own consent, distinct from the savings consent. Add a purpose key
   `finance_insights` and gate the section on it, with a clear explanation of what is collected
   and why, and a link to the Privacy Notice. Reuse the existing consent components and the
   `POST /consent` endpoint; do not invent a new consent mechanism.
2. **Receipt images are not kept.** State this in the upload UI: the image is read to extract the
   details and is then discarded. Only the structured fields are stored.
3. **Never put amounts, merchants or references in a URL or query string** that could be logged
   or shared. Use POST bodies.
4. **Default to private.** Spending totals use the existing `PrivacyBalance` pattern — blurred
   until tapped — exactly as balances do elsewhere in the app.
5. **Warn on third-party data.** A receipt may contain other people's details. Say so once, plainly,
   in the upload screen.

---

## 7. Quality bar

- Loading states on every async action; the backend is on a free tier and the first call after
  idle can take 30–60 seconds. Reuse the existing cold-start message pattern.
- Empty states that teach rather than just saying "nothing here".
- Error states that show the API's `error` message and offer a retry.
- Validate before submitting: amount greater than zero, date not in the future, category required.
- No console errors, no horizontal scroll at 390px, no placeholder text in shipped screens.

---

## 8. Explicitly do NOT

- Do not use Base44 entities, functions, workflows, storage, auth, or the Base44 SDK. (Repeating
  this because it is the single most important constraint.)
- Do not build a second HTTP client, auth system, or router — extend what exists.
- Do not hardcode English strings.
- Do not auto-save a parsed record without confirmation.
- Do not store or display a receipt image after extraction.
- Do not change the existing savings, groups, consent, export or deletion screens.
- Do not add new fonts, colours outside the token set, or a different icon library
  (`lucide-react` is already in use).
