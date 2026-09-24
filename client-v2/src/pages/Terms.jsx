import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-2xl items-center px-4 sm:px-6"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to Dusco</Link></div>
    </header>
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <FileText className="mb-3 h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026 · Larson Consulting (Tanzania)</p>
      </div>
      <Section title="1. The service">
        <p>Dusco provides envelope-based savings: one Dusco number receives money, which splits across your savings envelopes (bahashas), plus shared group savings (kikoba) with a member ledger. It is operated by Larson Consulting, a company registered in Tanzania.</p>
      </Section>
      <Section title="2. Demonstration environment">
        <p>This deployment is a demonstration product. <strong>All money movement — deposits, withdrawals, transfers, group contributions, and dividends — is simulated. No real funds are held or moved.</strong> Do not send real money to any number shown in the app.</p>
      </Section>
      <Section title="3. Eligibility and your account">
        <p>You must be at least 18 and register with your own phone number. Keep your credentials safe; activity under your account is treated as yours. Tell us promptly if you suspect unauthorised access.</p>
      </Section>
      <Section title="4. Fees">
        <p>Fees are shown before every transaction and are also summarised here:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Deposit from the settlement network — free.</li>
          <li>Cross-network deposit — 1%, minimum TZS 500.</li>
          <li>Withdrawal — 1%, between TZS 500 and TZS 5,000; free after 90 days of savings.</li>
          <li>Early unlock of a locked bahasha — 2% of its balance.</li>
        </ul>
        <p className="mt-2">We may change fees; changes are announced in the app before they take effect.</p>
      </Section>
      <Section title="5. Your responsibilities">
        <p>Use Dusco lawfully. You may not use the service for fraud, money laundering, or any activity prohibited by Tanzanian law. Group admins and treasurers act on behalf of their group and must follow their group’s own rules.</p>
      </Section>
      <Section title="6. Liability">
        <p>The service is provided as-is. To the extent permitted by law, Larson Consulting is not liable for indirect or consequential losses. Nothing in these terms limits liability that cannot be limited by law. Since this is a simulation, no customer funds can be lost through the service.</p>
      </Section>
      <Section title="7. Ending the service">
        <p>You may stop using the app at any time. We may suspend accounts used unlawfully or that breach these terms, with notice where practicable.</p>
      </Section>
      <Section title="8. Governing law">
        <p>These terms are governed by the laws of the United Republic of Tanzania.</p>
      </Section>
      <div className="flex gap-4 border-t pt-6 text-sm"><Link to="/privacy" className="font-medium text-primary">Privacy Notice</Link><Link to="/register" className="text-muted-foreground">Create an account</Link></div>
    </main>
  </div>;
}

function Section({ title, children }) {
  return <section><h2 className="font-display text-xl font-semibold">{title}</h2><div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-medium">{children}</div></section>;
}