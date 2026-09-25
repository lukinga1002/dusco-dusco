import React from "react";

const STEPS = [
  { n: "01", t: "Set your bahashas", d: "Name your envelopes — akiba, karo, safari — and choose what percentage of every deposit each gets." },
  { n: "02", t: "Share your Dusco number", d: "You get one number, like DUS-A3K9M2. Share it the way you'd share a phone number." },
  { n: "03", t: "Money splits itself", d: "When money arrives it divides across your envelopes instantly. No manual moves." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">How it works</h2>
        <p className="text-dusco-ink-soft text-center mt-2">Three steps, then it runs itself.</p>
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {STEPS.map((s, i) => (
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