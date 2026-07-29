import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Activity, ArrowRight, BarChart3, BrainCircuit, Cloud, Eye, EyeOff, Lock, Mail, NotebookPen, ShieldAlert, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setVerificationMessage('Email verified successfully! You can now log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email address before logging in.');
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_28%),#020617] px-3 py-4 text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/60 shadow-[0_35px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl lg:rounded-[28px]">
        <div className="relative hidden w-[48%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,211,238,0.2),_transparent_25%),radial-gradient(circle_at_80%_70%,_rgba(34,197,94,0.18),_transparent_30%)]" />
          <div className="absolute right-8 top-8 h-36 w-36 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-8 left-10 h-32 w-32 rounded-full border border-emerald-400/20 bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
              <Sparkles size={16} />
              Built for modern traders
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-[2.6rem] leading-tight">
              Master Your Trading Performance
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
              Turn every trade into a sharper insight with real-time analytics, journal clarity, and risk intelligence in one premium workspace.
            </p>
          </div>

          <div className="relative z-10 rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.2)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Performance overview</p>
                <p className="text-sm text-slate-400">Live edge indicators and review trends</p>
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
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Welcome Back</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Sign in to your desk</h2>
              <p className="mt-2 text-sm text-slate-400">Continue your review ritual with a brighter, faster workspace.</p>
            </div>

            {verificationMessage && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{verificationMessage}</div>}
            {error && <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" placeholder="Email address" required />
              </div>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" placeholder="Password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[13px] text-slate-400 transition hover:text-cyan-300">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-white/10 bg-slate-900 text-cyan-400" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-cyan-300 transition hover:text-cyan-200">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3.5 font-semibold text-slate-950 transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Signing in...' : 'Sign in'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
