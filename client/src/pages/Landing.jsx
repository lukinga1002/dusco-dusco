import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: '📱', title: 'Get your Dusco number', desc: 'Register with your phone number and receive a unique DUS-XXXXXX code' },
  { icon: '✉️', title: 'Set up your bahashas', desc: 'Create savings envelopes and decide how deposits are split' },
  { icon: '💸', title: 'Send money — it splits automatically', desc: 'Every deposit is instantly distributed across your bahashas' },
];

const values = [
  { icon: '🌐', title: 'Works with every network', desc: 'M-Pesa, Tigo Pesa, Airtel, Halotel, CRDB, NMB — all supported' },
  { icon: '📈', title: 'Earn dividends on your savings', desc: 'Your pooled savings earn returns from government securities. You get 30%.' },
  { icon: '🔒', title: 'Lock & protect your goals', desc: 'Lock a bahasha until a target date. Stay disciplined, reach your goals.' },
  { icon: '🆓', title: 'Free same-network deposits', desc: 'No fee when depositing from the same mobile money network.' },
];

const fees = [
  { action: 'Deposit (same network)', fee: 'Free' },
  { action: 'Deposit (cross-network)', fee: '1% (min TZS 500)' },
  { action: 'Withdrawal', fee: '1% (min TZS 500, max TZS 5,000)' },
  { action: 'Withdrawal (90+ days held)', fee: 'Free' },
  { action: 'Early bahasha unlock', fee: '2% of locked amount' },
];

export default function Landing() {
  // Pre-warm the backend so login is instant when the user signs in
  useEffect(() => { fetch('/api/health').catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-2xl font-black text-dusco">dusco</span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-dark-soft hover:text-dusco transition">Sign In</Link>
          <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-dusco text-white rounded-lg hover:bg-dusco-dark transition">Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-dark leading-tight">
          Your Money.<br />Your Bahashas.<br /><span className="text-dusco">Your Rules.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Dusco splits every deposit into savings envelopes automatically. Save smarter without thinking about it.
        </p>
        <Link to="/register" className="inline-block mt-8 px-8 py-4 bg-dusco text-white font-bold text-lg rounded-xl hover:bg-dusco-dark transition shadow-lg shadow-dusco/20">
          Join Dusco — It's Free
        </Link>
        <p className="mt-4 text-xs text-gray-500">No app download needed. Works on any phone browser.</p>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-dark mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-dusco-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">{s.icon}</div>
                <div className="text-xs text-dusco font-bold mb-2">Step {i + 1}</div>
                <h3 className="font-bold text-dark mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Dusco */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-dark mb-12">Why Dusco?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 flex gap-4">
                <span className="text-2xl shrink-0">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-dark mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Transparency */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-dark mb-3">Transparent Fees</h2>
          <p className="text-center text-gray-500 text-sm mb-8">No surprises. No hidden costs. Here's exactly what you pay.</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {fees.map((f, i) => (
              <div key={i} className={`flex justify-between items-center px-6 py-4 ${i < fees.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-sm text-dark font-medium">{f.action}</span>
                <span className={`text-sm font-bold ${f.fee === 'Free' ? 'text-success' : 'text-dark'}`}>{f.fee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center hero-gradient relative overflow-hidden">
        <h2 className="text-3xl font-bold text-white mb-4">Start saving smarter today</h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">Join thousands of Tanzanians who use Dusco to automatically organize their money.</p>
        <Link to="/register" className="inline-block px-8 py-4 bg-white text-dusco font-bold text-lg rounded-xl hover:bg-gray-50 transition">
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 bg-dark">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xl font-black text-dusco">dusco</span>
            <p className="text-xs text-gray-500 mt-1">Built for Tanzania 🇹🇿</p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-gray-600">&copy; 2026 Dusco. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
