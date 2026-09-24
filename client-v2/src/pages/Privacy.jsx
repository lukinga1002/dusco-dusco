import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function Privacy() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to Dusco</Link></div>
    </header>
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <ShieldCheck className="mb-3 h-8 w-8 text-dusco-green" />
        <h1 className="font-display text-3xl font-semibold">Privacy Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026 · Dusco is operated by Larson Consulting (Tanzania)</p>
      </div>
      <Section title="What we collect">
        <p>We collect and process the personal data needed to run your savings service:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong>Identity and contact data</strong> — your name, phone number, and Dusco number.</li>
          <li><strong>Financial and transaction data</strong> — bahasha balances, deposits, withdrawals, transfers, fees, group contributions, and dividend records.</li>
          <li><strong>Group membership data</strong> — your role, share totals, and contribution history within a kikoba.</li>
          <li><strong>Security and usage data</strong> — authentication events and basic service logs that keep the platform safe.</li>
        </ul>
      </Section>
      <Section title="Why we process it, and our lawful basis">
        <p>We process your financial and transaction data to operate the savings service you asked for — opening your envelopes, splitting deposits, and keeping your ledgers accurate. This rests on <strong>contract</strong> (performing the service) and your <strong>consent</strong>, captured separately at registration. Marketing messages are optional and require their own consent, which you can withdraw at any time from settings.</p>
        <p className="mt-2">Financial data about identifiable people is high-risk personal data under the Personal Data Protection Act (Cap. 44, 2023). We treat it accordingly.</p>
      </Section>
      <Section title="How long we keep it">
        <p>We keep your account and transaction records while your account is open and for the period required by Tanzanian financial record-keeping law. If you close your account, we delete or anonymise your personal data once those legal periods pass.</p>
      </Section>
      <Section title="Who we share it with">
        <p>We share data only as needed to run the service:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong>Payment and settlement partners</strong> — to move money to and from mobile money networks and banks.</li>
          <li><strong>Service providers</strong> — hosting and infrastructure, under contract and no wider use.</li>
          <li><strong>Group members</strong> — your name, role, and share ledger entries are visible to fellow members of a group you join.</li>
        </ul>
        <p className="mt-2">We never sell your personal data.</p>
      </Section>
      <Section title="Your rights">
        <p>Under the Personal Data Protection Act you can ask to access, correct, or delete your data, object to or restrict processing, and withdraw consent. In this demo, these controls live in Settings and are marked where a request is pending backend support. For anything else, contact us through the app.</p>
      </Section>
      <Section title="Children">
        <p>Dusco is not directed at children. You must be at least 18 to open an account.</p>
      </Section>
      <Section title="Changes">
        <p>If we change this notice we will tell you in the app before the change takes effect. The current version is always available on this page.</p>
      </Section>
      <p className="rounded-xl bg-dusco-gold-soft p-4 text-sm text-foreground">This is a demonstration environment. Money movement is simulated and no real customer funds are held.</p>
      <div className="flex gap-4 border-t pt-6 text-sm"><Link to="/terms" className="font-medium text-primary">Terms of Service</Link><Link to="/register" className="text-muted-foreground">Create an account</Link></div>
    </main>
  </div>;
}

function Section({ title, children }) {
  return <section><h2 className="font-display text-xl font-semibold">{title}</h2><div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-medium">{children}</div></section>;
}