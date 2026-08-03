import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { Activity, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Cloud, Eye, EyeOff, Lock, NotebookPen, ShieldAlert, Sparkles, XCircle } from 'lucide-react';

const PasswordStrengthMeter = ({ validation }) => {
  const { length, uppercase, lowercase, number, specialChar } = validation;
  const strength = [length, uppercase, lowercase, number, specialChar].filter(Boolean).length;
  const strengthColors = { 0: 'bg-gray-200', 1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-yellow-500', 4: 'bg-cyan-500', 5: 'bg-green-500' };
  const strengthText = { 0: '', 1: 'Very weak', 2: 'Weak', 3: 'Medium', 4: 'Strong', 5: 'Very strong' };

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${strength * 20}%` }} />
      </div>
      <p className={`mt-2 text-xs font-semibold ${strength > 3 ? 'text-green-600' : 'text-text-secondary'}`}>{strengthText[strength]}</p>
      <ul className="mt-2 space-y-1 text-xs text-text-secondary">
        <li className={`flex items-center ${length ? 'text-green-600' : ''}`}><span className="mr-2">{length ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>At least 8 characters</li>
        <li className={`flex items-center ${uppercase ? 'text-green-600' : ''}`}><span className="mr-2">{uppercase ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One uppercase letter</li>
        <li className={`flex items-center ${lowercase ? 'text-green-600' : ''}`}><span className="mr-2">{lowercase ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One lowercase letter</li>
        <li className={`flex items-center ${number ? 'text-green-600' : ''}`}><span className="mr-2">{number ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One number</li>
        <li className={`flex items-center ${specialChar ? 'text-green-600' : ''}`}><span className="mr-2">{specialChar ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>One special character</li>
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
      <div className="flex min-h-screen items-center justify-center bg-primary px-4 text-text-primary">
        <div className="rounded-lg border border-gray-200 bg-primary-light px-6 py-5 text-sm text-text-secondary shadow-lg">
          Verifying reset link...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary px-3 py-4 text-text-primary sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-primary-light shadow-2xl lg:rounded-3xl">
        <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-primary-light p-8 lg:flex">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-2 text-sm text-secondary">
              <Sparkles size={16} />
              Secure recovery
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-text-primary sm:text-[2.6rem] leading-tight">
              Master Your Trading Performance
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-text-secondary">
              Choose a strong password that protects your trading account and the performance history you rely on every day.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-gray-200 bg-white/5 p-5 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Protected reset flow</p>
                <p className="text-sm text-text-secondary">A secure and polished recovery path</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featureItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-primary/40 px-3 py-2 text-sm text-text-secondary">
                  <Icon size={15} className="text-secondary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-primary-light p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">TradePilot</p>
                <p className="text-sm text-text-secondary">Performance OS</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-secondary">Reset password</p>
              <h2 className="mt-2 text-3xl font-semibold text-text-primary">Set a new password</h2>
              <p className="mt-2 text-sm text-text-secondary">Choose a strong password to keep your account protected.</p>
            </div>

            {error && !isValidCode && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                <p>{error}</p>
                <p className="mt-2">
                  <Link to="/forgot-password" className="font-semibold text-secondary transition hover:text-secondary-dark">Request a new reset link.</Link>
                </p>
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                <p>{message}</p>
                <p className="mt-2">
                  <Link to="/login" className="font-semibold text-secondary transition hover:text-secondary-dark">Go to sign in.</Link>
                </p>
              </div>
            )}

            {isValidCode && !message && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-gray-400" />
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-primary py-3 pl-10 pr-12 text-sm text-text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20" required />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[13px] text-gray-400 transition hover:text-secondary">
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {newPassword && <PasswordStrengthMeter validation={passwordValidation} />}

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-gray-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-primary py-3 pl-10 pr-12 text-sm text-text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[13px] text-gray-400 transition hover:text-secondary">
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <button type="submit" disabled={loading || !isPasswordValid} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-secondary to-secondary-dark px-4 py-3.5 font-semibold text-white transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
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
