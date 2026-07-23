import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { Activity, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Cloud, Eye, EyeOff, Lock, NotebookPen, ShieldAlert, Sparkles, XCircle } from 'lucide-react';

const PasswordStrengthMeter = ({ validation }) => {
  const { length, uppercase, lowercase, number, specialChar } = validation;
  const strength = [length, uppercase, lowercase, number, specialChar].filter(Boolean).length;
  const strengthColors = { 0: 'bg-slate-700', 1: 'bg-rose-500', 2: 'bg-orange-500', 3: 'bg-amber-500', 4: 'bg-cyan-500', 5: 'bg-emerald-500' };
  const strengthText = { 0: '', 1: 'Very weak', 2: 'Weak', 3: 'Medium', 4: 'Strong', 5: 'Very strong' };

  return (
    <div className="mt-3 rounded-[16px] border border-white/10 bg-slate-900/60 p-3">
      <div className="h-2 w-full rounded-full bg-slate-800">
        <div className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${strength * 20}%` }} />
      </div>
      <p className={`mt-2 text-xs font-semibold ${strength > 3 ? 'text-emerald-300' : 'text-slate-400'}`}>{strengthText[strength]}</p>
      <ul className="mt-2 space-y-1 text-xs text-slate-400">
        <li className={`flex items-center ${length ? 'text-emerald-300' : ''}`}><span className="mr-2">{length ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>At least 8 characters</li>
        <li className={`flex items-center ${uppercase ? 'text-emerald-300' : ''}`}><span className="mr-2">{uppercase ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One uppercase letter</li>
        <li className={`flex items-center ${lowercase ? 'text-emerald-300' : ''}`}><span className="mr-2">{lowercase ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One lowercase letter</li>
        <li className={`flex items-center ${number ? 'text-emerald-300' : ''}`}><span className="mr-2">{number ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One number</li>
        <li className={`flex items-center ${specialChar ? 'text-emerald-300' : ''}`}><span className="mr-2">{specialChar ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One special character</li>
      </ul>
    </div>
  );
};

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    length: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const oobCode = React.useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('oobCode');
  }, [location.search]);

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing password reset code.');
      setLoading(false);
      return;
    }
    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch (err) {
        setError('The password reset link is invalid, expired, or has already been used.');
        setIsValidCode(false);
      } finally {
        setLoading(false);
      }
    };
    verifyCode();
  }, [oobCode]);

  useEffect(() => {
    setPasswordValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isPasswordValid) {
      setError('Password does not meet all the requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Your password has been successfully reset.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError('Failed to reset password. The link may have expired or been used.');
    } finally {
      setLoading(false);
    }
  };

  const featureItems = [
    { icon: BrainCircuit, label: 'AI Trading Analytics' },
    { icon: BarChart3, label: 'Performance Dashboard' },
    { icon: NotebookPen, label: 'Trading Journal' },
    { icon: ShieldAlert, label: 'Risk Analysis' },
    { icon: Cloud, label: 'Cloud Sync' },
  ];

  if (loading && !isValidCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="rounded-[20px] border border-white/10 bg-slate-900/70 px-6 py-5 text-sm text-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          Verifying reset link...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_28%),#020617] px-3 py-4 text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/60 shadow-[0_35px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl lg:rounded-[28px]">
        <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,211,238,0.2),_transparent_25%),radial-gradient(circle_at_80%_70%,_rgba(34,197,94,0.18),_transparent_30%)]" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
              <Sparkles size={16} />
              Secure recovery
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-[2.6rem] leading-tight">
              Master Your Trading Performance
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
              Choose a strong password that protects your trading account and the performance history you rely on every day.
            </p>
          </div>

          <div className="relative z-10 rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.2)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Protected reset flow</p>
                <p className="text-sm text-slate-400">A secure and polished recovery path</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featureItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-300">
                  <Icon size={15} className="text-cyan-300" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md rounded-[20px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">TradePilot</p>
                <p className="text-sm text-slate-400">Performance OS</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Reset password</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Set a new password</h2>
              <p className="mt-2 text-sm text-slate-400">Choose a strong password to keep your account protected.</p>
            </div>

            {error && !isValidCode && (
              <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <p>{error}</p>
                <p className="mt-2">
                  <Link to="/forgot-password" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Request a new reset link.</Link>
                </p>
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <p>{message}</p>
                <p className="mt-2">
                  <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Go to sign in.</Link>
                </p>
              </div>
            )}

            {isValidCode && !message && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[13px] text-slate-400 transition hover:text-cyan-300">
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {newPassword && <PasswordStrengthMeter validation={passwordValidation} />}

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                  <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[13px] text-slate-400 transition hover:text-cyan-300">
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <button type="submit" disabled={loading || !isPasswordValid} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3.5 font-semibold text-slate-950 transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? 'Saving...' : 'Set new password'}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
