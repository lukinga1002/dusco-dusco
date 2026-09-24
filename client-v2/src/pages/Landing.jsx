import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ShieldCheck, Wallet, Users, Split, Bell, Lock, ArrowRight, Check, Target } from "lucide-react";

const ENVELOPE_COLORS = ["#ED1B24", "#3B82F6", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dusco-cream text-dusco-ink font-body">
      <SiteHeader />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Groups />
      <Trust />
      <Faq />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-dusco-cream/80 backdrop-blur-md border-b border-dusco-line/50">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-dusco-gold-soft font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg">Dusco</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-dusco-ink hover:text-dusco-red transition-colors">Log in</Link>
          <Link to="/register" className="px-4 py-2 rounded-xl bg-dusco-ink text-white text-sm font-medium hover:bg-dusco-ink/90 transition-colors">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dusco-red-tint via-dusco-cream to-dusco-cream" />
      <div className="relative max-w-5xl mx-auto px-5 pt-14 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-dusco-line text-xs font-medium text-dusco-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-dusco-green" /> Operated by Larson Consulting
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight mt-5">
            One number.<br />
            <span className="text-dusco-red">Many envelopes.</span>
          </h1>
          <p className="text-dusco-ink-soft text-lg leading-relaxed mt-5 max-w-md">
            Tanzanians already save by purpose — school fees, the farm, emergencies. Dusco gives you one number.
            Money sent to it splits itself across your savings envelopes, automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-dusco-red text-white font-medium hover:bg-dusco-red-dark transition-colors">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-dusco-line text-dusco-ink font-medium hover:bg-dusco-sand transition-colors">
              See how it works
            </a>
          </div>
          <p className="text-xs text-dusco-ink-mute mt-4">Demo environment · simulated money movement · no real funds</p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-80 sm:h-96">
      {/* incoming */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-dusco-ink text-white shadow-xl z-10">
        <p className="text-[10px] opacity-70 uppercase tracking-wider">Sent to DUS-A3K9M2</p>
        <p className="font-display text-xl font-semibold tabular-nums">TZS 500,000</p>
      </div>
      {/* connector lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 380" preserveAspectRatio="none">
        <g stroke="hsl(var(--border))" strokeWidth="2" fill="none">
          <path d="M200 70 L80 230" />
          <path d="M200 70 L200 230" />
          <path d="M200 70 L320 230" />
        </g>
      </svg>
      {/* envelopes */}
      <div className="absolute bottom-4 inset-x-0 grid grid-cols-3 gap-3 px-2">
        {[
          { name: "Akiba", pct: 50, amt: "250,000", c: "hsl(var(--chart-1))" },
          { name: "Karo", pct: 30, amt: "150,000", c: "hsl(var(--chart-2))" },
          { name: "Safari", pct: 20, amt: "100,000", c: "hsl(var(--chart-4))" },
        ].map((e, i) => (
          <div key={i} className="rounded-2xl p-3.5 shadow-md" style={{ background: e.c }}>
            <p className="text-[10px] uppercase tracking-wider text-white/80">Bahasha</p>
            <p className="font-display text-sm font-semibold text-white truncate">{e.name}</p>
            <p className="font-display text-lg font-semibold text-white tabular-nums mt-1">TZS {e.amt}</p>
            <p className="text-[10px] text-white/70">{e.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Problem() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { t: "Savings are fragmented", d: "Money sits across networks and pockets, divided by purpose — hard to see the whole picture." },
          { t: "Networks don't talk", d: "Receiving from M-Pesa, Airtel, or a bank means juggling fees and references for every transfer." },
          { t: "Groups run on paper", d: "Kikoba and VICOBA track contributions in notebooks and cash boxes — no clear member ledger." },
        ].map((p, i) => (
          <div key={i} className="rounded-2xl bg-white border border-dusco-line p-5">
            <p className="font-display font-semibold text-dusco-ink">{p.t}</p>
            <p className="text-sm text-dusco-ink-soft mt-2 leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Set your bahashas", d: "Name your envelopes — akiba, karo, safari — and choose what percentage of every deposit each gets." },
    { n: "02", t: "Share your Dusco number", d: "You get one number, like DUS-A3K9M2. Share it the way you'd share a phone number." },
    { n: "03", t: "Money splits itself", d: "When money arrives it divides across your envelopes instantly. No manual moves." },
  ];
  return (
    <section id="how" className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">How it works</h2>
        <p className="text-dusco-ink-soft text-center mt-2">Three steps, then it runs itself.</p>
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <p className="font-display text-5xl font-semibold text-dusco-gold">{s.n}</p>
              <p className="font-display text-lg font-semibold mt-2">{s.t}</p>
              <p className="text-sm text-dusco-ink-soft mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Split, t: "Automatic splitting", d: "Every deposit divides across your envelopes by the percentages you set." },
    { icon: Wallet, t: "Receive from any network", d: "M-Pesa, Airtel, Tigo, banks — one number accepts them all." },
    { icon: Target, t: "Goals & locks", d: "Set a target on any envelope, or lock it until a date to resist temptation." },
    { icon: Users, t: "Group savings", d: "Run a kikoba with a group number, member ledger, and shares + social fund." },
    { icon: Lock, t: "Private by default", d: "Balances are blurred until you tap to reveal — safe in shared spaces." },
    { icon: Bell, t: "Transparent fees", d: "Every fee is shown before money moves. No surprises, ever." },
  ];
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <h2 className="font-display text-3xl font-semibold text-center">Built for how you save</h2>
      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {items.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-dusco-line">
              <div className="w-11 h-11 rounded-xl bg-dusco-gold-soft flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold">{f.t}</p>
                <p className="text-sm text-dusco-ink-soft mt-1 leading-relaxed">{f.d}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Groups() {
  return (
    <section className="bg-dusco-ink text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 grid sm:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-dusco-gold-soft font-medium">For groups · Kikoba / VICOBA</span>
          <h2 className="font-display text-3xl font-semibold mt-3">The digital cash box</h2>
          <p className="text-white/70 mt-3 leading-relaxed">
            Give your chama its own Dusco number. Track each member's contributions, keep shares
            and the social fund separate, and see the group's total at a glance.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-2xl bg-white text-dusco-ink font-medium hover:bg-white/90 transition-colors">
            Start a group <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold">Umoja Savings Group</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-dusco-gold-soft text-primary">DUS-G7K2P4</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Shares</p>
              <p className="font-display text-lg font-semibold tabular-nums">TZS 1,240,000</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Social fund</p>
              <p className="font-display text-lg font-semibold tabular-nums">TZS 380,000</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {["Amani · TZS 320,000", "Neema · TZS 280,000", "Juma · TZS 240,000"].map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-dusco-green" /> {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const fees = [
    { label: "Deposit (same network)", value: "Free" },
    { label: "Deposit (cross network)", value: "1% · min TZS 500" },
    { label: "Withdrawal", value: "1% · TZS 500–5,000" },
    { label: "Withdrawal after 90 days", value: "Free" },
    { label: "Early unlock penalty", value: "2% of balance" },
  ];
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <ShieldCheck className="w-8 h-8 text-dusco-green" />
          <h2 className="font-display text-2xl font-semibold mt-4">Trust & transparency</h2>
          <p className="text-dusco-ink-soft mt-3 leading-relaxed">
            Dusco is operated by Larson Consulting, a registered company. Customer funds are
            designed to be held with a licensed financial institution. Every fee is shown before
            a transaction — nothing is hidden.
          </p>
          <p className="text-xs text-dusco-ink-mute mt-4">
            Dusco does not hold customer deposits itself and is not a licensed bank. This is a
            demonstration environment with simulated money movement.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-dusco-line overflow-hidden">
          <p className="px-4 py-3 border-b border-dusco-line font-display font-semibold text-sm">Fees, plainly</p>
          {fees.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-dusco-line/60 last:border-0">
              <span className="text-sm text-dusco-ink-soft">{f.label}</span>
              <span className="text-sm font-medium text-dusco-ink text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "What is a bahasha?", a: "A bahasha is a savings envelope — a pot of money set aside for a purpose, like school fees or emergencies. You set what percentage of every incoming deposit goes to each one." },
    { q: "Do I need a new phone number?", a: "No. You get one Dusco number (like DUS-A3K9M2). People send money to it from any network or bank, and it routes into your envelopes." },
    { q: "Is my money safe?", a: "Dusco is operated by Larson Consulting and customer funds are designed to be held with a licensed financial institution. This demo uses simulated money — no real funds move." },
    { q: "Can I lock my savings?", a: "Yes. Lock a bahasha until a future date to keep it untouched. Unlocking early applies a 2% penalty on the balance; unlocking after the date is free." },
  ];
  return (
    <section className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">Questions</h2>
        <div className="mt-8 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-dusco-line overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-dusco-ink">{it.q}</span>
                <ChevronDown className={`w-5 h-5 text-dusco-ink-mute transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-dusco-ink-soft leading-relaxed">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-dusco-gold-soft font-display font-bold">D</span>
        <span className="font-display font-semibold text-lg">Dusco</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-dusco-ink-soft">
        <Link to="/privacy" className="hover:text-dusco-ink">Privacy Notice</Link>
        <Link to="/terms" className="hover:text-dusco-ink">Terms</Link>
        <Link to="/login" className="hover:text-dusco-ink">Log in</Link>
        <Link to="/register" className="hover:text-dusco-ink">Get started</Link>
      </div>
      <p className="text-xs text-dusco-ink-mute mt-6">
        © {new Date().getFullYear()} Larson Consulting. Dusco is a demonstration product. Money movement is simulated.
      </p>
    </footer>
  );
}