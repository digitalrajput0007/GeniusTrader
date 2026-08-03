import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_28%),#020617] px-3 py-4 text-slate-100 sm:px-5 lg:px-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[20px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <BrandLogo />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Welcome Back</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in to your account</h2>
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
  );
};

export default LoginPage;
