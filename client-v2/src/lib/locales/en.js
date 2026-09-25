// English — the reference dictionary. Every other locale is checked against
// this set at startup in development (see lib/i18n.jsx), so a missing key is
// caught while writing code rather than by a user meeting a stray English
// sentence inside a Kiswahili page.
//
// Scope note: this covers the public landing page and the whole sign-up /
// sign-in flow. In-app screens after sign-in are not translated yet and are
// tracked in docs/PARKED.md.

export const en = {
  // ── Common ──────────────────────────────────────────────
  "common.getStarted": "Get started",
  "common.login": "Log in",
  "common.continue": "Continue",
  "common.back": "Back",
  "common.language": "Language",

  // ── Landing: header & hero ──────────────────────────────
  "landing.operatedBy": "Operated by Larson Consulting",
  "landing.hero.title1": "Your Saving,",
  "landing.hero.title2": "Simplified.",
  "landing.hero.body":
    "Take control of your saving with your Dusco number that receives money from any account or wallet and splits it across your saving envelopes, automatically.",
  "landing.hero.seeHow": "See how it works",
  "landing.hero.demoNote": "Demo environment · simulated money movement · no real funds",

  // ── Landing: problem ────────────────────────────────────
  "landing.problem.1.title": "Savings are fragmented",
  "landing.problem.1.body":
    "Money sits across networks and pockets, divided by purpose — hard to see the whole picture.",
  "landing.problem.2.title": "Networks don't talk",
  "landing.problem.2.body":
    "Receiving from M-Pesa, Airtel, or a bank means juggling fees and references for every transfer.",
  "landing.problem.3.title": "Groups run on paper",
  "landing.problem.3.body":
    "Kikoba and VICOBA track contributions in notebooks and cash boxes — no clear member ledger.",

  // ── Landing: how it works ───────────────────────────────
  "landing.how.title": "How it works",
  "landing.how.subtitle": "Three steps, then it runs itself.",
  "landing.how.1.title": "Set your bahashas",
  "landing.how.1.body":
    "Name your envelopes — akiba, karo, safari — and choose what percentage of every deposit each gets.",
  "landing.how.2.title": "Share your Dusco number",
  "landing.how.2.body":
    "You get one number, like DUS-A3K9M2. Share it the way you'd share a phone number.",
  "landing.how.3.title": "Money splits itself",
  "landing.how.3.body":
    "When money arrives it divides across your envelopes instantly. No manual moves.",

  // ── Landing: features ───────────────────────────────────
  "landing.features.title": "Built for how you save",
  "landing.features.1.title": "Automatic splitting",
  "landing.features.1.body":
    "Every deposit divides across your envelopes by the percentages you set.",
  "landing.features.2.title": "Receive from any network",
  "landing.features.2.body": "M-Pesa, Airtel, Tigo, banks — one number accepts them all.",
  "landing.features.3.title": "Goals & locks",
  "landing.features.3.body":
    "Set a target on any envelope, or lock it until a date to resist temptation.",
  "landing.features.4.title": "Group savings",
  "landing.features.4.body":
    "Run a kikoba with a group number, member ledger, and shares + social fund.",
  "landing.features.5.title": "Private by default",
  "landing.features.5.body":
    "Balances are blurred until you tap to reveal — safe in shared spaces.",
  "landing.features.6.title": "Transparent fees",
  "landing.features.6.body": "Every fee is shown before money moves. No surprises, ever.",

  // ── Landing: groups ─────────────────────────────────────
  "landing.groups.eyebrow": "For groups · Kikoba / VICOBA",
  "landing.groups.title": "The digital cash box",

  // ── Landing: trust ──────────────────────────────────────
  "landing.trust.title": "Trust & transparency",
  "landing.trust.fee.depositSame": "Deposit (same network)",
  "landing.trust.fee.depositCross": "Deposit (cross network)",
  "landing.trust.fee.withdrawal": "Withdrawal",
  "landing.trust.fee.withdrawal90": "Withdrawal after 90 days",
  "landing.trust.fee.earlyUnlock": "Early unlock penalty",
  "landing.trust.fee.free": "Free",
  "landing.trust.fee.crossValue": "1% · min TZS 500",
  "landing.trust.fee.withdrawalValue": "1% · TZS 500–5,000",
  "landing.trust.fee.earlyUnlockValue": "2% of balance",

  "landing.groups.body":
    "Give your chama its own Dusco number. Track each member's contributions, keep shares and the social fund separate, and see the group's total at a glance.",
  "landing.groups.cta": "Start a group",
  "landing.groups.shares": "Shares",
  "landing.groups.socialFund": "Social fund",
  "landing.trust.body":
    "Dusco is operated by Larson Consulting, a registered company. Customer funds are designed to be held with a licensed financial institution. Every fee is shown before a transaction — nothing is hidden.",
  "landing.trust.disclaimer":
    "Dusco does not hold customer deposits itself and is not a licensed bank. This is a demonstration environment with simulated money movement.",
  "landing.trust.feesTitle": "Fees, plainly",

  // ── Landing: FAQ ────────────────────────────────────────
  "landing.faq.title": "Questions",
  "landing.faq.1.q": "What is a bahasha?",
  "landing.faq.1.a":
    "A bahasha is a savings envelope — a pot of money set aside for a purpose, like school fees or emergencies. You set what percentage of every incoming deposit goes to each one.",
  "landing.faq.2.q": "Do I need a new phone number?",
  "landing.faq.2.a":
    "No. You get one Dusco number (like DUS-A3K9M2). People send money to it from any network or bank, and it routes into your envelopes.",
  "landing.faq.3.q": "Is my money safe?",
  "landing.faq.3.a":
    "Dusco is operated by Larson Consulting and customer funds are designed to be held with a licensed financial institution. This demo uses simulated money — no real funds move.",
  "landing.faq.4.q": "Can I lock my savings?",
  "landing.faq.4.a":
    "Yes. Lock a bahasha until a future date to keep it untouched. Unlocking early applies a 2% penalty on the balance; unlocking after the date is free.",

  // ── Landing: footer ─────────────────────────────────────
  "landing.footer.privacy": "Privacy Notice",
  "landing.footer.terms": "Terms",

  "landing.footer.copyright": "© {year} Larson Consulting. Dusco is a demonstration product. Money movement is simulated.",

  "landing.hero.sentTo": "Sent to {number}",
  "landing.groups.demoName": "Umoja Savings Group",
  "auth.otp.error.length": "Enter the 4-digit code",
  "auth.otp.error.failed": "Could not verify. Try again.",

  // ── Auth: register ──────────────────────────────────────
  "auth.register.title": "Open your Dusco account",
  "auth.register.subtitle": "Get a Dusco number and set up your savings envelopes.",
  "auth.register.name": "Full name",
  "auth.register.namePlaceholder": "Amani Mushi",
  "auth.register.phone": "Phone number",
  "auth.register.password": "Password",
  "auth.register.passwordPlaceholder": "At least 6 characters",
  "auth.register.submit": "Create account",
  "auth.register.haveAccount": "Already have an account?",
  "auth.register.languageLabel": "Choose your language",
  "auth.register.languageHelp": "You can change this later in Settings.",
  "auth.register.error.name": "Enter your name",
  "auth.register.error.phone": "Use a Tanzanian number, e.g. 0712345678",
  "auth.register.error.password": "At least 6 characters",

  // ── Auth: consent ───────────────────────────────────────
  "auth.consent.heading": "Your consent",
  "auth.consent.operate":
    "I consent to Dusco processing my financial and transaction data to operate my savings account.",
  "auth.consent.operateHelp":
    "Required to run the service — splitting deposits, showing balances, and recording transactions.",
  "auth.consent.marketing": "Send me occasional product updates and savings tips.",
  "auth.consent.marketingHelp": "Optional. You can withdraw this any time in Settings.",
  "auth.consent.reviewPrefix": "You can review how your data is used in our",
  "auth.consent.reviewLink": "Privacy Notice",
  "auth.consent.error.operate": "We need this to run your account",

  // ── Auth: login ─────────────────────────────────────────
  "auth.login.title": "Welcome back",
  "auth.login.subtitle": "Log in to your envelopes.",
  "auth.login.phone": "Phone number",
  "auth.login.password": "Password",
  "auth.login.passwordPlaceholder": "Your password",
  "auth.login.submit": "Log in",
  "auth.login.noAccount": "New to Dusco?",
  "auth.login.createAccount": "Create an account",
  "auth.login.waking": "Waking up secure servers…",

  // ── Auth: OTP ───────────────────────────────────────────
  "auth.otp.title": "Verify your number",
  "auth.otp.sentTo": "We sent a code to {phone}.",
  "auth.otp.yourNumber": "YOUR DUSCO NUMBER",
  "auth.otp.shareNote": "This is your identity in Dusco. Share it to receive money.",
  "auth.otp.demoNote": "Demo: OTP is simulated — enter any 4 digits to continue.",
  "auth.otp.submit": "Verify & continue",
  "auth.otp.wrongNumber": "Wrong number?",
  "auth.otp.startOver": "Start over",
};
