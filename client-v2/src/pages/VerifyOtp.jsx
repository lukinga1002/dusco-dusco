import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "@/components/dusco/AuthShell";
import { useColdStartMessage } from "@/components/dusco/ColdStartLoader";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeOtp } = useDuscoAuth();
  const phone = location.state?.phone || "";
  const name = location.state?.name || "";
  const duscoNumber = location.state?.duscoNumber || "";

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const slow = useColdStartMessage();

  useEffect(() => {
    if (!phone) navigate("/register", { replace: true });
    else refs[0].current?.focus();
    // eslint-disable-next-line
  }, []);

  const onChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length !== 4) { setError("Enter the 4-digit code"); return; }
    setLoading(true);
    try {
      await completeOtp(phone, otp);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.message || "Could not verify. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Verify your number"
      subtitle={
        <>
          We sent a code to <span className="font-medium text-dusco-ink">{phone || "your phone"}</span>.
        </>
      }
      footer={<>Wrong number? <Link to="/register" className="text-dusco-red font-medium">Start over</Link></>}
    >
      {duscoNumber && (
        <div className="mb-6 rounded-2xl bg-dusco-ink text-white p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-white/60">Your Dusco number</p>
          <p className="font-display text-3xl font-semibold mt-1 tracking-wide">{duscoNumber}</p>
          <p className="text-xs text-white/60 mt-2">This is your identity in Dusco. Share it to receive money.</p>
        </div>
      )}

      <div className="rounded-xl bg-dusco-gold-soft border border-dusco-gold/30 px-3.5 py-2.5 mb-6 text-xs text-dusco-ink-soft">
        <span className="font-medium text-dusco-gold">Demo:</span> OTP is simulated — enter any 4 digits to continue.
      </div>

      <form onSubmit={submit}>
        <div className="flex gap-3 justify-between mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="w-16 h-16 text-center text-2xl font-display font-semibold rounded-2xl border border-dusco-line bg-white text-dusco-ink focus:outline-none focus:border-dusco-red focus:ring-2 focus:ring-dusco-red/15"
            />
          ))}
        </div>

        {error && <p className="text-sm text-dusco-red bg-dusco-red-soft rounded-xl px-3 py-2.5 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-dusco-red text-white font-medium hover:bg-dusco-red-dark disabled:opacity-60 transition-colors"
        >
          {loading ? (slow ? "Waking up secure servers…" : "Verifying…") : "Verify & continue"}
        </button>
      </form>
    </AuthShell>
  );
}