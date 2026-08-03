import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowRight, Mail } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import AnimatedAuthBackground from '../components/AnimatedAuthBackground';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const actionCodeSettings = {
      url: 'http://localhost:3000/action',
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage('Password reset link sent! Please check your email.');
    } catch (err) {
      setError('Failed to send password reset email. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-3 py-4 text-slate-100 sm:px-5 lg:px-6 flex items-center justify-center relative">
        <AnimatedAuthBackground />
        <div className="relative z-10 w-full max-w-md rounded-[20px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <BrandLogo />
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Recover access</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Forgot your password?</h2>
            </div>

            {message && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
            {error && <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" placeholder="Email address" required />
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3.5 font-semibold text-slate-950 transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Sending...' : 'Send reset link'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Remembered it?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Return to sign in</Link>
            </p>
          </div>
    </div>
  );
};

export default ForgotPasswordPage;
