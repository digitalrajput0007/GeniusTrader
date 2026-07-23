import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Activity, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Cloud, Eye, EyeOff, Lock, Mail, NotebookPen, ShieldAlert, Sparkles, UserRound, XCircle } from 'lucide-react';

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

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', mobile: '', gender: '', password: '', confirmPassword: '' });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ length: false, uppercase: false, lowercase: false, number: false, specialChar: false });

  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      if (/^[0-9\b]{0,10}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Password does not meet all the requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!agree) {
      toast.error('You must agree to the terms and conditions.');
      return;
    }

    const result = await signup(formData.email, formData.password, formData.firstName, formData.lastName, formData.mobile, formData.gender);
    if (result) {
      navigate('/login');
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
                <p className="text-sm font-semibold text-white">Trading command center</p>
                <p className="text-sm text-slate-400">From setup to review in seconds</p>
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
          <div className="w-full max-w-xl rounded-[20px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
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
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Create account</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Start your premium journey</h2>
              <p className="mt-2 text-sm text-slate-400">A faster, clearer way to track every trade and decision.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                  <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                </div>
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                  <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                </div>
              </div>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input type="tel" name="mobile" placeholder="Mobile number" value={formData.mobile} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
                <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full rounded-[16px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${formData.gender ? 'text-white' : 'text-slate-400'}`} required>
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[13px] text-slate-400 transition hover:text-cyan-300">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {formData.password && <PasswordStrengthMeter validation={passwordValidation} />}
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-[14px] text-slate-500" />
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} className="w-full rounded-[16px] border border-white/10 bg-slate-900/80 py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[13px] text-slate-400 transition hover:text-cyan-300">
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <label className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-400">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 rounded border-white/10 bg-slate-900 text-cyan-400" />
                <span>I agree to the <button type="button" className="font-medium text-cyan-300 transition hover:text-cyan-200" onClick={() => toast('Terms and Conditions page is not yet implemented.')}>Terms and Conditions</button></span>
              </label>
              <button type="submit" disabled={isSigningUp || !isPasswordValid} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3.5 font-semibold text-slate-950 transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                {isSigningUp ? 'Creating account...' : 'Create account'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
