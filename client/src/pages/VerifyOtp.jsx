import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || '';
  const duscoNumber = state?.duscoNumber || '';

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 4) return setError('Enter all 4 digits');
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      navigate('/setup-bahashas', { state: { duscoNumber } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-dusco-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-dark mb-2">Verify Your Phone</h1>
        <p className="text-sm text-gray-500">Enter the 4-digit code sent to <span className="font-medium text-dark">{phone}</span></p>
        <p className="text-xs text-gray-300 mt-1">(Demo: any 4 digits work)</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-3 mb-6">
          {digits.map((d, i) => (
            <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
              value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              className="w-14 h-14 text-center text-xl font-heading font-bold rounded-2xl border-2 border-gray-200 focus:border-dusco bg-gray-50 focus:bg-white" />
          ))}
        </div>

        {error && <p className="text-error text-xs text-center mb-4">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-dusco text-white font-heading font-semibold rounded-2xl hover:bg-dusco-dark transition disabled:opacity-50">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
